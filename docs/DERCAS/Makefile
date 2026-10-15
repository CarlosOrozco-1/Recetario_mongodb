DERCAS_DIR := $(CURDIR)
FIGURAS_DIR := $(DERCAS_DIR)/figuras
DIAGRAMAS_DIR := $(DERCAS_DIR)/../diagramas
TEX := main.tex
OUT := main.pdf

TECTONIC_DIR ?= $(HOME)/.local/share/recetario-tools
TECTONIC_BIN ?= $(TECTONIC_DIR)/tectonic

SVG := $(wildcard $(DIAGRAMAS_DIR)/flujo/*.svg) \
       $(wildcard $(DIAGRAMAS_DIR)/casos-uso/*.svg) \
       $(wildcard $(DIAGRAMAS_DIR)/secuencia/*.svg) \
       $(wildcard $(DIAGRAMAS_DIR)/estado/*.svg) \
       $(DIAGRAMAS_DIR)/diagrama-er.svg

FIGURAS := $(patsubst $(DIAGRAMAS_DIR)/%.svg,$(FIGURAS_DIR)/%.pdf,$(SVG))

all: $(OUT)

$(TECTONIC_BIN):
	@mkdir -p $(TECTONIC_DIR)
	curl -L --silent https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.17.0/tectonic-0.17.0-x86_64-unknown-linux-gnu.tar.gz | tar xz -C $(TECTONIC_DIR)
	@chmod +x $(TECTONIC_BIN)

$(FIGURAS_DIR)/%.pdf: $(DIAGRAMAS_DIR)/%.svg
	@mkdir -p $(dir $@)
	rsvg-convert -f pdf1.5 "$<" -o "$@"

$(OUT): $(TEX) $(wildcard *.tex) $(FIGURAS) $(TECTONIC_BIN)
	$(TECTONIC_BIN) $(TEX) --outdir .

clean:
	rm -f *.aux *.log *.out *.toc *.bbl *.blg *.lof *.lot *.fls *.fdb_latexmk *.synctex.gz $(OUT)
	rm -rf $(FIGURAS_DIR)

.PHONY: all clean
