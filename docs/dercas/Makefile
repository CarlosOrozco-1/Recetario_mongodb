DERCAS_DIR := $(CURDIR)
BUILD_DIR := $(DERCAS_DIR)/build
DIAGRAMAS_DIR := $(DERCAS_DIR)/diagramas
TECTONIC_DIR ?= $(HOME)/.local/share/recetario-tools
TECTONIC_BIN ?= $(TECTONIC_DIR)/tectonic
TECTONIC_VERSION := 0.17.0
TECTONIC_URL := https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.17.0/tectonic-0.17.0-x86_64-unknown-linux-gnu.tar.gz
DERCAS_PDF := $(BUILD_DIR)/dercas.pdf

SVG_FILES := $(shell find $(DIAGRAMAS_DIR) -name '*.svg')
DIAGRAM_PDFS := $(patsubst $(DIAGRAMAS_DIR)/%.svg,$(BUILD_DIR)/%.pdf,$(SVG_FILES))

.PHONY: all clean

all: $(DERCAS_PDF)

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(TECTONIC_BIN):
	mkdir -p $(TECTONIC_DIR)
	curl -fsSL -o /tmp/tectonic.tar.gz $(TECTONIC_URL)
	tar -xzf /tmp/tectonic.tar.gz -C $(TECTONIC_DIR)
	rm -f /tmp/tectonic.tar.gz
	chmod +x $(TECTONIC_BIN)

$(BUILD_DIR)/%.pdf: $(DIAGRAMAS_DIR)/%.svg
	@mkdir -p $(dir $@)
	rsvg-convert -f pdf -o $@ $<

$(DERCAS_PDF): $(DERCAS_DIR)/dercas.tex $(wildcard $(DERCAS_DIR)/capitulos/*.tex) $(DIAGRAM_PDFS) $(TECTONIC_BIN) | $(BUILD_DIR)
	cd $(DERCAS_DIR) && $(TECTONIC_BIN) dercas.tex --outdir $(BUILD_DIR)

clean:
	rm -rf $(BUILD_DIR)
