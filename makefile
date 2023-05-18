.PHONY: help
help: # Show help for each of the Makefile recipes.
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m:$$(echo $$l | cut -f 2- -d'#')\n"; done

.PHONY: build
build: # build the extension bundle
	rm -rf ./dist
	npm run build

.PHONY: test
test: # test the code
	npm run prettier:check # check formatting
	npm run tsc            # validate that we can compile
	npm run test           # run the unit tests

.PHONY: release
release: # build the release package
	npm run build
	rm -rf ./release && mkdir -p ./release
	cd ./dist && zip ../release/chatgpt-diagrams-extension.zip . -r
	ls ./release

.PHONY: serve-samples
serve-samples: # serve the sample ChatGPT pages.
	(cd samples/ && python -m http.server 3000)
