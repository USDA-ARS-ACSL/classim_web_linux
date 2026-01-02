Here are the instructions to build a version that runs on a non https pc for testing
you have to use the local env file. In this repo, it is both .env.local and .env - the env file for the web version is in env without the dot.

the differences are in the CORS names and DOMAIN names

use 
docker image prune 
docker container prune 

to remove all unused and dangling images and containers

when the containers are running properly on HTTP port 8000, your application should be fully functional. You can access:

Frontend: http://localhost
Backend API: http://localhost:8000
API Documentation: http://localhost:8000/docs
Database Admin: http://localhost:8080

you can use this command to check logs if something does not build. use container name at the end
docker compose -f docker-compose.yml -f docker-compose.local.yml logs backend

to rebuild all the images before starting the containers:
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build


The -d flag runs them in detached mode (in the background).

up = start containers (use existing images)
up --build = rebuild images AND start containers
build --no-cache then up = force complete rebuild then start

Git - depending on your setup you may or may not be using the same branch name localy as you are using
on the server (local_dev). for example, my local branch name is main_dev for some reason (I will change it later maybe)
to push changes to the server (I mapped origin to TFS) use
git push origin main_dev:local_dev
if you are already tracking the remote branch local_dev and even if you have different names then git push will work


