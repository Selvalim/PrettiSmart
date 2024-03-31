<template>
    <div style="height:100%;width:100%;background:#ffffff" ref="net_container" class="display-flex">
        <svg class="net" :height="this.svgHeight" :width="this.svgWidth"></svg>             
    </div>
</template>

<script>
import * as d3 from "d3"


export default {
    name:"netView",
    props:['data'],
    data(){
        return {
            svgHeight:'0',
            svgWidth:'0',
        }
    },
    computed:{
    },
    methods:{

    },
    created(){
    },
    mounted(){
        console.log(this.data)
    },
    updated(){
    },
    unmounted(){
    }
}
</script>

<style>
.lil_title {
    font-size: 1.6em;
    /* font-weight: bolder; */
    /* font-family: 'Metropolis'; */
}
</style>