import requests

def run_job(server_url, webhook_token, job_name):
    url = f"{server_url}/api/webhooks/run-jobs?token={webhook_token}&run={job_name}"
    try:
        response = requests.get(url)
        print(response.json())
        print(f"{job_name} job started successfully.")
    except requests.exceptions.RequestException as err:
        print(f"Failed to start {job_name} job. Error: {err}")


server_url = "http://mikomiko.cc"
webhook_token = "1234"

# 定义要运行的作业列表
job_names = [
    'apply-contest-tags',
    'apply-voted-tags',
    'deliver-purchased-cosmetics',
    'disable-voted-tags',
    'send-notifications',
    'send-webhooks',
    'update-metrics-models',
    'update-metrics'
]

for job_name in job_names:
    run_job(server_url, webhook_token, job_name)