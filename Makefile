.PHONY: build serve clean

build:
	zola build
	npm run build:demos
	npm run build:site

serve:
	zola serve

clean:
	rm -rf public node_modules
