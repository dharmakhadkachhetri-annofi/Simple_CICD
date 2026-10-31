# Todo CI/CD Deployment

## Stack
- Frontend: HTML/CSS/JavaScript
- NGINX: :80
- Spring Boot WAR
- Tomcat: :8081
- MySQL: :3306
- Jenkins: :8080

## MySQL
Run `deployment/mysql.sql` in MySQL.

## Backend
    cd backend
    mvn clean package

WAR:
    backend/target/todo-backend.war

Deploy:
    sudo cp target/todo-backend.war /opt/tomcat/webapps/
    sudo systemctl restart tomcat

Test:
    curl -i http://localhost:8081/todo-backend/api/todos

## Frontend
    sudo cp -r frontend/* /var/www/html/

## NGINX
Use `deployment/nginx-server-block.conf` in the active NGINX configuration.

    sudo nginx -t
    sudo systemctl reload nginx

Test:
    curl -i http://localhost/api/todos

## Tomcat service
    sudo cp deployment/tomcat.service /etc/systemd/system/tomcat.service
    sudo systemctl daemon-reload
    sudo systemctl enable tomcat
    sudo systemctl restart tomcat

## API
GET     /api/todos
GET     /api/todos/{id}
POST    /api/todos
PUT     /api/todos/{id}
DELETE  /api/todos/{id}

Do not expose 8080, 8081, 3306 or 8005 publicly.
