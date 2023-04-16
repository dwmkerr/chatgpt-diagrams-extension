.PHONY: help
help: # Show help for each of the Makefile recipes.
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m:$$(echo $$l | cut -f 2- -d'#')\n"; done

.PHONY: build
build:
	rm -rf ./dist
	npm run build

.PHONY: serve-samples
serve-samples: # serve the sample ChatGPT pages.
	(cd samples/ && python -m http.server 3000)
