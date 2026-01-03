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
  

openssl pkcs7 -print_certs -in ARSMDBE3412ACSL.p7b -out chain.pem

next copy the cer and pem file together to another pem file
cat ARSMDBE3412ACSL.cer chain.pem ARSMDBE3412ACSL.pem

these files and the key file should be in the root folder  of the frontend and you need to modify, nginx.conf and Dockerfile files in case the names change
The cert and key names are also included in the last line of the docker file in the backend cacerts folder

I included the p7b file but I am not sure it is absolutely required.

other changes I made to get the certificates to work:
Docker files - check these for references to certificates. I also copied the certs to the cacert folder in the backend and the root folder in the frontend. Note that there are 
copy commands in the docker files. there is also an nginx.conf file in the frontend that references the certs. I also added the http forwarding command here as well. in the .env 
file I changed the domain name from a number to the name.

I changed both docker files to add the correct cert names, they are evident in the file
these were the files I changed.
        modified:   .env
        modified:   README.md
        modified:   backend/Dockerfile
        modified:   frontend/.env
        modified:   frontend/Dockerfile
        modified:   frontend/nginx.conf
now https is working