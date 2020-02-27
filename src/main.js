import Vue from "vue";
import Vue2Filters from "vue2-filters";
import App from "./App.vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "element-ui/lib/theme-chalk/reset.css";
import locale from "element-ui/lib/locale/lang/pt";

Vue.config.productionTip = false;

Vue.use(Vue2Filters);
Vue.use(ElementUI, { locale });

Vue.options.filters.real = value => {
  if (!value) return "?";

  return Vue.options.filters.currency(value, "R$", 2, {
    thousandsSeparator: ".",
    decimalSeparator: ","
  });
};

Vue.options.filters.date = stringDate => {
  if (!stringDate) return "";

  return new Date(stringDate).toLocaleDateString("pt-BR");
};

Vue.options.filters.number = value => {
  if (!value) return "?";

  return Number(value).toLocaleString();
};

new Vue({
  render: h => h(App)
}).$mount("#app");
