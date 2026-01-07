This Repo has code for linux version of web model interface. 
To run this application locally
1. Clone this repo. If you have cloned repo,  pull the latest changes using "git pull" 
2. install Docker desktop
3. CD to cloned repo and enter "docker compose up --build"
   on linux use docker-compose up --build
4. After that go to browser and enter "http://localhost"

How to update certificates
use the conf file to generate a csr and send this to IT you also need to generate a key file at the same time
They will return a p7b and cer file. The p7b file contains intermediate certs which have to be extracted to a pem file
  
generate a private key
openssl genrsa -out ARSMDBE3142ACSL.usda.net.key 2048

generate a csr

openssl req -new -key ARSMDBE3142ACSL.usda.net.key -out ACSL3142ACSL2.csr -config classim.cnf

after you get the new cert
openssl pkcs7 -print_certs -in ARSMDBE3412ACSL.p7b -out chain.pem

next copy the cer and pem file together to another pem file
cat ARSMDBE3412ACSL.cer chain.pem ARSMDBE3412ACSL.pem

these files and the key file should be in the root folder  of the frontend and you need to modify, nginx.conf and Dockerfile files in case the names change
The cert and key names are also included in the last line of the docker file in the backend cacerts folder

I included the p7b file but I am not sure it is absolutely required.

other changes I made to get the certificates to work:
Docker files - check these for references to certificates. I also copied the certs to the cacert folder in the backend and the root folder in the frontend. Note that there are 
copy commands in the docker files. there is also an nginx.conf file in the frontend that references the certs. I also added the http forwarding command here as 
 changed the domain name from a number to the name.

I changed both docker files to add the correct cert names, they are evident in the file
these were the files I changed.
        modified:   .env
        modified:   README.md
        modified:   backend/Dockerfile
        modified:   frontend/.env
        modified:   frontend/Dockerfile
        modified:   frontend/nginx.conf
now https is working
if you have errors when deploying using docker-compose up --build where the containers build but the front or backend cannot run because it cannot find the app folder with the shared folders, then use docker-compose down to shut down all the containers. It is always a good idea to run docker-compose down first before rebuilding

to access the database"
http://arsmdbe3142acsl:8080/?pgsql=db&username=postgres&db=app&ns=public

the use of only :8080 with the url is not working now.

to debug the backend:
Step 1: Run Backend Locally with Docker
# On Windows, in your project directory
cd backend
docker build -t local-backend .
docker run -p 8443:8443 -v $(pwd):/app local-backend

Step 2: Modify Remote Frontend Configuration
On your Linux server, temporarily update the frontend's API URL:
# Create/modify .env file in frontend directory
echo "VITE_API_URL=https://your-windows-ip:8443" > frontend/.env.local
Or if using environment variables in docker-compose:
frontend:
  environment:
    - VITE_API_URL=https://your-windows-ip:8443
	
Step 3: Configure Windows Firewall	
# Allow inbound connections on port 8443
New-NetFirewallRule -DisplayName "Backend Debug" -Direction Inbound -Port 8443 -Protocol TCP -Action Allow	

Step 4: Rebuild/Restart Remote Frontend
# On Linux server
docker-compose down
docker-compose up --build frontend

Step 5: Access & Debug

Browse to https://arsmdbe3142acsl.usda.net (remote frontend)
OIDC login works normally (correct redirect URI)
API calls hit your local Windows backend
Set breakpoints in VS Code and debug!
When done debugging, just revert the VITE_API_URL change and redeploy.

Need help with any of these steps?

Claude Sonnet 4 • 1x	

