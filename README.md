### Для запуска проекта:
1. __yarn / npm i__

2. Создать __.env__ в директории __server__, в котором должны быть заданы следующие переменные:
  * SERVER_PORT
  * CLIENT
  * SERVER
  * MYSQL_HOST
  * MYSQL_USER
  * MYSQL_PASSWORD
  * MYSQL_DATABASE
  * JWT_KEY
  * JWT_LIFETIME (в секундах)
  * REFRESH_TOKEN_LIFETIME (в секундах)
  * EMAIL_SERVICE
  * EMAIL_USER
  * EMAIL_PASS
  * GOOGLE_MAPS_API_KEY
  
3. __yarn run build-client / npm run build-client__

4. __yarn run server / npm run server__
