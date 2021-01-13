run:
	npx ts-node -r dotenv/config app/src/app.ts

lib:
	cd squire && npx ts-node -r dotenv/config src/index.ts

build:
	npm run build --prefix squire
