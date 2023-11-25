<template>
<n-layout class="h-screen max-h-screen" :content-style="{ display: 'flex', flexDirection: 'column',}">
  <n-layout-header>
      <div class="techname text-light-50 text-shadow-lg font-bold" style="padding-left: 15px;" >NFT Disk</div>
</n-layout-header>
<n-layout-content class="flex-1" style="width:100%;height:100%" >
  <n-layout style="width:100%;height:100%" :content-style="{ display: 'flex', flexDirection: 'row'}">
      <n-card 
        size="small"
        style="width:100%;height:100%;" 
        header-style="text-align:left;height:50px;font-size:1.7em"
        >
        <template #header>
        </template>
          <wash-view
        />

      </n-card>     
      <!-- <wash-view/>   -->
        <!-- <n-card 
      size="small"
      style="width:30%;height:100%;"
      title="Trans History"
      header-style="text-align:left;height:50px;font-size:1.7em"
      content-style="overflow:auto"
      class="scroll"
      > 
      <trans-view />
      </n-card> -->
    </n-layout>
</n-layout-content>
<n-layout-footer position="absolute" style="height: 18px">
  <div class="footer"></div>
</n-layout-footer>
</n-layout>
</template>


<script>
import { NCard,NLayout,NSwitch,NSpace,NLayoutHeader,NLayoutFooter,NLayoutContent } from "naive-ui"
import WashView from './WashView.vue'
import TransView from './TransView.vue'


export default {
  components:{ NCard, NLayout, NSwitch, NSpace, NLayoutHeader, NLayoutFooter, NLayoutContent, WashView, TransView },
  data(){
    return {
    }
  },
  methods:{
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
a {
  color: #42b983;
}
.techname {
  background-color:#323130;
  color: aliceblue;
  font-size: 2.0em;
  padding-left: 10px;
  padding-top:7px; 
  height: 50px;
}
.footer {
  height: 18px;
  font-size: 0.8em;
  text-align: center;
  background-color: rgb(79, 81, 80);
    color: aliceblue;
}
</style>
