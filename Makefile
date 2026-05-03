.PHONY: dev
dev:
	SET NODE_OPTIONS=--openssl-legacy-provider && vue-cli-service build --mode development
	scp -P 10022 -r dist/* root@101.37.84.227:/root/front/exam

