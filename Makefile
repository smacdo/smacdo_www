.PHONY: build serve clean

build:
	zola build
	npm run build:demos

serve:
	zola serve

clean:
	rm -rf public node_modules
