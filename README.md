https://drive.google.com/drive/folders/1ELXnjBfq_CSCkF5RNGsT5-AdUgNO1RSd?usp=drive_link

https://docs.google.com/spreadsheets/d/1HSOnKa6dvOPPfWfdAPzi441ofntPurCw_QxVeOELFc4/edit?usp=sharing

Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
docker run -d --hostname my-rabbit --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
