run:
	clear; cd app && node -r dotenv/config src/app.js

update:
	npm install --prefix squire
	rm -rf app/node_modules/squire && npm install --prefix app