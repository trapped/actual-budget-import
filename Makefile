# Project lifecycle; generated test evidence and user data are retained.
.DEFAULT_GOAL := help
.PHONY: help setup clean prune
DRY_RUN ?= 0
ifeq ($(DRY_RUN),1)
REMOVE_LOCAL = printf 'Would remove: %s\n'
else
REMOVE_LOCAL = rm -rf --
endif

help:
	@printf '%s\n' 'make setup  Install dependencies from package-lock.json' 'make clean  Remove reproducible build output' 'make prune  Also remove local node_modules' '            DRY_RUN=1 previews cleanup'

setup:
	npm ci

clean:
	@echo "No reproducible build outputs are owned by this project."

prune: clean
	$(REMOVE_LOCAL) node_modules
