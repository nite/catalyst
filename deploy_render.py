#!/usr/bin/env python3
"""
Render Deployment Script for Catalyst
Uses Render API to deploy services defined in render.yaml
"""

import os
import sys
import json
import requests
import yaml
import time

# Render API configuration
RENDER_API_BASE = "https://api.render.com/v1"

def load_render_yaml(filepath="render.yaml"):
    """Load and parse render.yaml configuration"""
    with open(filepath, 'r') as f:
        return yaml.safe_load(f)

def get_api_key():
    """Get Render API key from environment or prompt"""
    api_key = os.environ.get('RENDER_API_KEY')
    if not api_key:
        print("Error: RENDER_API_KEY environment variable not set")
        print("\nTo deploy to Render, you need an API key:")
        print("1. Go to https://dashboard.render.com/account/settings")
        print("2. Generate an API key under 'API Keys'")
        print("3. Set it: export RENDER_API_KEY='your-api-key'")
        sys.exit(1)
    return api_key

def create_headers(api_key):
    """Create authorization headers for API requests"""
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

def get_owner_id(headers):
    """Get the owner (user/team) ID"""
    response = requests.get(f"{RENDER_API_BASE}/owners", headers=headers)
    if response.status_code == 200:
        owners = response.json()
        if owners:
            return owners[0]['owner']['id']
    print(f"Error getting owner: {response.status_code}")
    return None

def create_web_service(service_config, owner_id, headers):
    """Create a web service on Render"""
    
    # Map render.yaml config to Render API format
    service_data = {
        "name": service_config['name'],
        "ownerId": owner_id,
        "type": "web_service",
        "repo": os.environ.get('GITHUB_REPOSITORY', 'https://github.com/nite/catalyst'),
        "branch": os.environ.get('GITHUB_REF_NAME', 'copilot/add-dataset-integration-functionality'),
        "envSpecificDetails": {
            "buildCommand": service_config.get('buildCommand', ''),
            "startCommand": service_config.get('startCommand', ''),
        },
        "serviceDetails": {
            "env": service_config.get('env', 'docker'),
            "region": service_config.get('region', 'oregon'),
            "plan": "free",
            "healthCheckPath": service_config.get('healthCheckPath', '/'),
        }
    }
    
    # Add environment variables
    if 'envVars' in service_config:
        env_vars = {}
        for var in service_config['envVars']:
            env_vars[var['key']] = var['value']
        service_data['envSpecificDetails']['envVars'] = env_vars
    
    print(f"\nCreating service: {service_config['name']}")
    print(f"  Type: {service_config.get('type', 'web')}")
    print(f"  Env: {service_config.get('env', 'docker')}")
    
    response = requests.post(
        f"{RENDER_API_BASE}/services",
        headers=headers,
        json=service_data
    )
    
    if response.status_code in [200, 201]:
        service = response.json()
        print(f"✓ Service created: {service.get('service', {}).get('name')}")
        return service
    else:
        print(f"✗ Error creating service: {response.status_code}")
        print(f"  Response: {response.text}")
        return None

def create_static_site(service_config, owner_id, headers):
    """Create a static site on Render"""
    
    static_data = {
        "name": service_config['name'],
        "ownerId": owner_id,
        "repo": os.environ.get('GITHUB_REPOSITORY', 'https://github.com/nite/catalyst'),
        "branch": os.environ.get('GITHUB_REF_NAME', 'copilot/add-dataset-integration-functionality'),
        "buildCommand": service_config.get('buildCommand', ''),
        "publishPath": service_config.get('staticPublishPath', './dist'),
        "envVars": []
    }
    
    # Add environment variables
    if 'envVars' in service_config:
        for var in service_config['envVars']:
            static_data['envVars'].append({
                "key": var['key'],
                "value": var['value']
            })
    
    print(f"\nCreating static site: {service_config['name']}")
    
    response = requests.post(
        f"{RENDER_API_BASE}/static-sites",
        headers=headers,
        json=static_data
    )
    
    if response.status_code in [200, 201]:
        site = response.json()
        print(f"✓ Static site created: {site.get('staticSite', {}).get('name')}")
        return site
    else:
        print(f"✗ Error creating static site: {response.status_code}")
        print(f"  Response: {response.text}")
        return None

def deploy_from_yaml():
    """Main deployment function"""
    print("=" * 60)
    print("Catalyst Deployment to Render")
    print("=" * 60)
    
    # Get API key
    api_key = get_api_key()
    headers = create_headers(api_key)
    
    # Get owner ID
    owner_id = get_owner_id(headers)
    if not owner_id:
        print("Failed to get owner ID")
        return False
    
    print(f"\nOwner ID: {owner_id}")
    
    # Load render.yaml
    config = load_render_yaml()
    services = config.get('services', [])
    
    print(f"\nFound {len(services)} services to deploy")
    
    deployed_services = []
    
    # Deploy each service
    for service in services:
        service_type = service.get('type', 'web')
        
        if service_type == 'web' and service.get('env') == 'static':
            # Static site
            result = create_static_site(service, owner_id, headers)
            if result:
                deployed_services.append({
                    'name': service['name'],
                    'type': 'static',
                    'url': result.get('staticSite', {}).get('url', 'pending')
                })
        else:
            # Web service
            result = create_web_service(service, owner_id, headers)
            if result:
                deployed_services.append({
                    'name': service['name'],
                    'type': 'web',
                    'url': result.get('service', {}).get('url', 'pending')
                })
    
    # Print summary
    print("\n" + "=" * 60)
    print("Deployment Summary")
    print("=" * 60)
    
    if deployed_services:
        print("\nDeployed Services:")
        for svc in deployed_services:
            print(f"  • {svc['name']} ({svc['type']})")
            print(f"    URL: {svc['url']}")
    else:
        print("\nNo services were deployed successfully")
    
    print("\n" + "=" * 60)
    return len(deployed_services) > 0

if __name__ == "__main__":
    try:
        success = deploy_from_yaml()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
