<template>
  <div id="app">
    <div v-show="!fullscreen" id="header">
      <div class="flex margin-right">
        <el-input
          id="url"
          class="url"
          ref="url"
          placeholder="Informe o link do leilão"
          v-model="form.url"
          @keyup.enter.native="onEnter($event)"
        ></el-input>

        <el-date-picker
          id="date"
          class="date"
          ref="date"
          v-model="form.date"
          type="date"
          placeholder="Data"
          format="dd/MM/yyyy"
          @keyup.enter.native="onEnter($event)"
          @change="onChangeDate"
          clearable
        ></el-date-picker>

        <el-time-picker
          id="time"
          class="time"
          ref="time"
          v-model="form.time"
          :picker-options="{
            selectableRange: '0:00:00 - 23:59:00'
          }"
          default-value="1970-01-01T03:00:00.000Z"
          format="HH:mm"
          value-format="HH:mm"
          @keyup.enter.native="onEnter($event)"
          @change="onChangeTime"
          placeholder="Horário"
        ></el-time-picker>

        <el-input
          id="circulation"
          class="circulation"
          ref="circulation"
          placeholder="Tiragem"
          v-model="form.circulation"
          @keyup.enter.native="onEnter($event)"
        ></el-input>

        <el-input
          id="min-price"
          class="price"
          ref="minPrice"
          placeholder="Preço Mínimo"
          v-model="form.minPrice"
          @keyup.enter.native="onEnter($event)"
        ></el-input>

        <el-input
          id="max-price"
          class="price"
          ref="maxPrice"
          placeholder="Preço Máximo"
          v-model="form.maxPrice"
          @keyup.enter.native="onEnter($event)"
        ></el-input>

        <el-button id="btn-add" type="primary" @click="onAddAuction"
          >Adicionar</el-button
        >
      </div>
    </div>
    <div id="auctions">
      <div class="auction expand" v-for="auction in auctions" :key="auction.id">
        <div class="flex-column card expand">
          <div slot="header" class="auction-header">
            <div class="info">
              <span class="inline-block">
                <i class="el-icon-date"></i>
                {{ auction.date | date() }}
              </span>
              <span class="inline-block">
                <i class="el-icon-coin"></i>
                {{ auction.circulation | number() }}
              </span>
              <span class="inline-block">
                <i class="el-icon-money"></i>
                {{ auction.minPrice | real() }} a
                {{ auction.maxPrice | real() }}
              </span>
              <span class="timer inline-block">
                <i class="el-icon-alarm-clock"></i>
                {{ auction.time + ":00" || "0:00:00" }}
              </span>
              <span class="timer inline-block">
                <i class="el-icon-time"></i>
                {{ currTime || "0:00:00" }}
              </span>
              <span
                v-bind:class="[
                  auction.expired
                    ? 'expired-countdown'
                    : auction.countdown < '0:01:00'
                    ? 'timer inline-block expiring-countdown'
                    : 'timer inline-block'
                ]"
              >
                <i class="el-icon-timer"></i>
                {{ auction.countdown || "?" }}
              </span>
            </div>

            <div class="btn-container">
              <el-button
                @click="onVisualize(auction.id)"
                class="btn"
                type="text"
                icon="header-icon el-icon-view"
              ></el-button>

              <el-button
                @click="onReload(auction.id)"
                class="btn"
                type="text"
                icon="header-icon el-icon-refresh"
              ></el-button>

              <el-button
                @click="onRemove(auction.id)"
                class="btn"
                type="text"
                icon="header-icon el-icon-delete"
              ></el-button>
            </div>
          </div>
          <webview
            :auction-id="auction.id"
            class="webview expand"
            ref="auctions"
            :src="auction.url"
          ></webview>
        </div>
      </div>
    </div>

    <div>
      <div id="btn-container-bottom">
        <el-tooltip content="Recarregar leilões">
          <el-button
            id="btn-refresh"
            type="primary"
            icon="bottom-icon el-icon-refresh"
            @click="onReloadAuctions"
            circle
          ></el-button>
        </el-tooltip>

        <el-tooltip content="Tela cheia">
          <el-button
            v-bind:class="[
              fullscreen ? 'btn-fullscreen-active' : 'btn-fullscreen-inactive'
            ]"
            icon="bottom-icon el-icon-s-platform"
            @click="onChangeMode"
            circle
          ></el-button>
        </el-tooltip>
        <el-tooltip content="Configurações">
          <el-button
            icon="bottom-icon el-icon-s-tools"
            @click="onClickConfig"
            circle
          ></el-button>
        </el-tooltip>
      </div>
    </div>

    <el-dialog
      title="Configurações"
      @open="onOpenConfigDialog"
      :visible.sync="configDialogVisible"
      width="450px"
    >
      <div>
        <el-checkbox v-model="configForm.daylightSavingTime"
          >Horário de verão</el-checkbox
        >
        <p id="daylight-info">Desconta uma hora do horário regular</p>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="configDialogVisible = false">Cancelar</el-button>
        <el-button type="primary" @click="onConfirmConfig">Confirmar</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { AuctionModel } from "./auction-model";
import { ConfigModel } from "./config-model";
import lib from "./lib";

const path = require("path");
const electron = require("electron");
const appPath = (electron.app || electron.remote.app).getPath("userData");
const DB_PATH = path.join(appPath, "db.json");
const CONFIG_PATH = path.join(appPath, "config.json");

function initialState() {
  return {
    auctionModel: new AuctionModel(DB_PATH),
    configModel: new ConfigModel(CONFIG_PATH),
    form: {
      url: "",
      date: null,
      time: null,
      circulation: null,
      minPrice: null,
      maxPrice: null
    },
    fullscreen: false,
    currTime: null,
    auctions: [],
    autoScrollInterval: 3000,
    configDialogVisible: false,
    configForm: {
      daylightSavingTime: false
    }
  };
}

export default {
  name: "app",
  components: {},
  data() {
    return initialState();
  },
  methods: {
    onEnter(evt) {
      // TODO - Finish this
      const id = evt.target.getAttribute("id");
      if (id === "max-price") {
        this.onAddAuction();
      }
    },
    onAddAuction() {
      if (!this.form.url) {
        this.$message({
          message: "Informe o link do leilão",
          type: "error"
        });
        return;
      }

      if (!this.form.date) {
        this.$message({
          message: "Informe a data do leilão",
          type: "error"
        });
        return;
      }

      if (!this.form.time) {
        this.$message({
          message: "Informe o horário do leilão",
          type: "error"
        });
        return;
      }

      if (this.hasAuction(this.form.url)) {
        this.$message({
          message: "Este leilão já foi adicionado",
          type: "warning"
        });
        return;
      }

      this.auctions.push({
        id: this.getId(),
        ...this.form
      });

      this.serializeAuctions();
      this.sortAuctions();
      this.setDomReadyEvents();
      this.resetForm();
      this.setInitialFocus();
      this.$message({
        message: "Leilão adicionado com sucesso",
        type: "success"
      });
    },
    serializeAuctions() {
      this.auctionModel.save(this.auctions);
    },
    deserializeAuctions() {
      this.auctions = this.auctionModel.find();
    },
    sortAuctions() {
      this.auctions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (dateA < dateB) {
          return -1;
        } else if (dateA > dateB) {
          return 1;
        } else {
          return a.time < b.time ? -1 : a.time > b.time ? 1 : 0;
        }
      });
    },
    loadAuctions() {
      this.deserializeAuctions();
      this.sortAuctions();
      this.setDomReadyEvents();
    },
    getId() {
      if (!this.auctions.length) return 0;

      const lastObject = this.auctions.reduce((prev, curr) =>
        prev.id > curr.id ? prev : curr
      );
      return lastObject.id + 1;
    },
    hasAuction(url) {
      if (!this.auctions) return false;

      return this.auctions.findIndex(auction => auction.url === url) >= 0;
    },
    setDomReadyEvents() {
      this.$nextTick(() => {
        if (this.$refs.auctions.length) {
          for (const webview of this.$refs.auctions) {
            webview.addEventListener("dom-ready", () => {
              webview.setZoomLevel(-1.2);
              webview.ready = true;
            });
          }
        }
      });
    },
    onReloadAuctions() {
      for (const auction of this.$refs.auctions) {
        auction.reloadIgnoringCache();
      }
    },
    onClickConfig() {
      this.configDialogVisible = true;
    },
    onOpenConfigDialog() {
      this.configForm = Object.assign(this.configForm, this.configModel.config);
    },
    onConfirmConfig() {
      this.configModel.save(this.configForm);
      this.configDialogVisible = false;
    },
    resetForm() {
      this.form = initialState().form;
    },
    computeAuctionsCountdown() {
      let now = new Date();
      if (this.configModel.config.daylightSavingTime)
        now.setHours(now.getHours() - 1);

      for (const auction of this.auctions) {
        if (auction.date && auction.time && !auction.expired) {
          const auctionDate = new Date(auction.date);
          const hours = Number(
            auction.time.substr(0, auction.time.indexOf(":"))
          );
          const minutes = Number(
            auction.time.substr(
              auction.time.indexOf(":") + 1,
              auction.time.length
            )
          );
          auctionDate.setHours(hours, minutes, 0, 0);

          if (auctionDate <= now) {
            auction.countdown = "0:00:00";
            auction.expired = true;
          } else {
            auction.countdown = lib.countdown(auctionDate, now);
          }
          this.$forceUpdate();
        }
      }
    },
    computeCurrTime() {
      let currTime = new Date();

      if (this.configModel.config.daylightSavingTime)
        currTime.setHours(currTime.getHours() - 1);

      this.currTime = currTime.toLocaleTimeString();
    },
    setupAutoScroll() {
      setInterval(() => {
        if (this.$refs.auctions) {
          for (const webview of this.$refs.auctions) {
            if (webview.ready) {
              const scrollDownScript = index => {
                return `document.getElementsByClassName('uiScrollableAreaWrap')[${index}].scrollTop = 10000`;
              };
              webview
                .executeJavaScript(scrollDownScript(1))
                .catch(() => {
                  return webview.executeJavaScript(scrollDownScript(0));
                })
                .catch(() => {
                  return webview.executeJavaScript(scrollDownScript(3));
                })
                .catch(() => {});
            }
          }
        }
      }, this.autoScrollInterval);
    },
    setupTimers() {
      setInterval(() => {
        this.computeAuctionsCountdown();
        this.computeCurrTime();
      }, 1000);
    },
    setInitialFocus() {
      this.$nextTick(() => {
        this.$refs.url.focus();
      });
    },
    reloadAuctionsWebview() {
      for (const auction of this.$refs.auctions) {
        auction.reloadIgnoringCache();
      }
    },
    onRemove(auctionId) {
      const auctionIdx = this.findAuctionIdx(auctionId);

      if (auctionIdx < 0) {
        return;
      }

      this.removeAuction(auctionIdx);
      this.serializeAuctions();
      this.setInitialFocus();
      this.$message({
        message: "Leilão removido com sucesso",
        type: "success"
      });
    },
    removeAuction(idx) {
      this.auctions.splice(idx, 1);
    },
    onReload(auctionId) {
      const auctionIdx = this.findAuctionsRefsIdx(auctionId);

      if (auctionIdx < 0) {
        return;
      }

      this.reloadAuction(auctionIdx);
    },
    findAuctionIdx(id) {
      const auctionIdx = this.auctions.findIndex(auction => auction.id === id);
      return auctionIdx;
    },
    findAuctionsRefsIdx(id) {
      const auctionIdx = this.$refs.auctions.findIndex(
        auction => auction.getAttribute("auction-id") === String(id)
      );

      return auctionIdx;
    },
    reloadAuction(idx) {
      this.$refs.auctions[idx].reloadIgnoringCache();
    },
    onChangeMode() {
      this.fullscreen = !this.fullscreen;

      if (!this.fullscreen) {
        this.setInitialFocus();
      }

      window.scrollTo(0, 0);
    },
    onChangeDate() {
      this.$nextTick(() => {
        this.$refs.time.focus();
      });
    },
    onChangeTime() {
      this.$nextTick(() => {
        this.$refs.circulation.focus();
      });
    },
    onVisualize(id) {
      const idx = this.findAuctionIdx(id);
      const link = this.auctions[idx].url;
      if (link) {
        electron.shell.openExternal(link);
      }
    }
  },
  mounted() {
    this.setupTimers();
    this.loadAuctions();
    this.setInitialFocus();
    this.setupAutoScroll();
  }
};
</script>

<style>
body {
  margin: 0;
  background-color: #f8f9fa;
}

.margin-right > * {
  margin-right: 0.5rem;
}

.el-button--primary {
  background-color: #4267b2 !important;
  border-color: #4267b2 !important;
}

.el-input__inner {
  border: 1px solid #7f8c8d !important;
  color: #2d3436 !important;
}

.flex {
  display: flex;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.expand {
  width: 100%;
}

.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

.inline-block {
  display: inline-block;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  margin: 0 auto;
  display: flex;
  padding: 1rem;
  flex-direction: column;
}

#app #header {
  margin: 0 auto 1rem auto;
  width: 85%;
  background-color: white;
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

#header .url {
  flex: 3;
}

#header .time,
#header .date,
#header .circulation,
#header .price {
  flex: 1;
}

#auctions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 0 auto;
  width: 100%;
}

.webview {
  height: 450px;
}

.auction-header {
  padding: 0.1rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  background-color: #4267b2;
  font-size: 1rem;
}

.auction-header .info > span {
  margin-right: 1rem;
}

.header-icon {
  font-size: 1.1rem;
  color: white;
}

.bottom-icon {
  font-size: 1.2rem;
}

#btn-container-bottom {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
}

#btn-container-bottom > * {
  margin-left: 0.5rem;
}

.btn-fullscreen-active {
  opacity: 0.5 !important;
}

.btn-fullscreen-inactive {
  border: 1 !important;
}

.expiring-countdown {
  color: #fcdb94;
}

.expired-countdown {
  color: #fc988f;
}

#daylight-info {
  font-size: 0.75rem;
  margin-top: 0.2rem;
}
</style>
