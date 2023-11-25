<template>
<n-layout class="h-screen max-h-screen" :content-style="{ display: 'flex', flexDirection: 'column',}">
  <n-layout-header>
      <div class="techname text-light-50 text-shadow-lg font-bold" style="padding-left: 15px;" >PonziLens</div>
</n-layout-header>
<n-layout-content class="flex-1" style="width:100%;height:100%" >
  <n-layout style="width:100%;height:100%" :content-style="{ display: 'flex', flexDirection: 'column'}">
 
        <n-card 
        class="custom-card"
      size="small"
      style="width:100%;height:100%;"
      header-style="text-align:left;height:50px;font-size:1.7em"

      > 
      <path-view 
      :act-color="actColor"
      :actions="actions"
      :selected_path="selected_path"
      @update_selected_path="update_selected_path"
      @update_selected_path_data="update_selected_path_data"
      />
      </n-card>
      <!-- <n-card 
        size="small"
        style="width:100%;height:55%;" 
        header-style="text-align:left;height:50px;font-size:1.7em"
        >
        <template #header>
        </template>
          <action-view
          :act-color="actColor"
          :actions="actions"
          :selected_path="selected_path"
          :selected_path_data="selected_path_data"
        />

      </n-card>     -->
    </n-layout>
</n-layout-content>
<n-layout-footer position="absolute" style="height: 18px">
  <div class="footer"></div>
</n-layout-footer>
</n-layout>
</template>


<script>
import { NCard,NLayout,NSwitch,NSpace,NLayoutHeader,NLayoutFooter,NLayoutContent } from "naive-ui"
import * as d3 from "d3"

import ActionView from './ActionView.vue'
import PathView from './PathView.vue'

// import Actions from "../assets/USDOracle-filtered.json"
// import Actions from "../assets/DynamicPyramid-filtered.json"
// import Actions from "../assets/Doubler-filtered.json"
// import Actions from "../assets/Etheramid-filtered.json"
import Actions from "../assets/MyScheme-filtered.json"
// import Actions from "../assets/whale-filtered.json"
// import Actions from "../assets/x15-filtered.json"
// import Actions from "../assets/withdraw-filtered.json"
// import Actions from "../assets/daily12-filtered.json"

export default {
  components:{ NCard, NLayout, NSwitch, NSpace, NLayoutHeader, NLayoutFooter, NLayoutContent, ActionView , PathView},
  data(){
    return {
      actColor:{
                'READ':'#c7c6b6',
                'WRITE':'#6e9bc5',
                'PAY':'#ee7959',
                'CONS':'#ffee6f',
                'LINE':'#b2b6b6',//
                'PATHLINE':'#6b798e',
                'STROKE':'white',
                'STORAGE':'#bba1cb',
                'D_FILTER':'#648072',
                'L_FILTER':'#d5ebe1',
            },
      actions: JSON.parse(JSON.stringify(Actions)),
      selected_path:0,
      selected_path_data:{},
    }
  },
  methods:{
    update_selected_path(idx){
      console.log('select path: '+idx)
      this.selected_path = idx
    },
    update_selected_path_data(data){
      console.log('update pathdata: ',data)
      this.selected_path_data = data
    },
  },
  beforeMount(){
  },
  mounted(){
  },
  updated(){
  }

}
</script>


<style scoped>
.custom-card {
  border:white
}
a {
  color: #42b983;
}
.techname {
  background-color:#323130;
  color: aliceblue;
  font-size: 1.5em;
  padding-left: 10px;
  padding-top:7px; 
  height: 40px;
}
.footer {
  height: 18px;
  font-size: 0.8em;
  text-align: center;
  background-color: rgb(79, 81, 80);
    color: aliceblue;
}
</style>
