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
    'add-on-demand-run-strategies',
    'mikomiko-init',
    'process-imports',
    'scan-files'

]

for job_name in job_names:
    run_job(server_url, webhook_token, job_name)

