<template>
    <div style="height:100%;width:100%;background:#d9d9d9" ref="trans_container" class="display-flex">
        <svg class="trans" :height="this.svgHeight" :width="this.svgWidth"></svg>             
    </div>
</template>

<script>
import * as d3 from "d3"
import All_Trans from "../assets/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D-new-new-trans.json"


export default {
    name:"TransView",
    props:[],
    data(){
        return {
            svgHeight:'0',
            svgWidth:'0',
            margin:{top:10,left:0,right:0},
            TransMargin:{x:60,y:200,height:500},
            AllTrans: JSON.parse(JSON.stringify(All_Trans)),
        }
    },
    computed:{
    },
    methods:{
        setSvg(){
            if(this.$refs.trans_container.offsetHeight){
                this.svgHeight = this.$refs.trans_container.offsetHeight;                
            }
            if(this.$refs.trans_container.offsetWidth){
                this.svgWidth = this.$refs.trans_container.offsetWidth;            
            }
            console.log("this.svg",this.$refs.trans_container.offsetHeight,this.svgHeight,this.svgWidth)
            this.drawInit()
        },
        drawInit(){
            let trans = this.AllTrans
            let that = this
            //get the svg
            let svg = d3.select("svg.trans")
                    .attr("width",that.svgWidth)
                    .attr("height",that.svgHeight)
            if(Object.keys(trans).length>0){
                // this.drawTrans(svg, trans)  
                // console.log('time',this.timeParser('2021-05-08T22:28:04.000Z'))              
            }
        },
        drawTrans(svg, trans){
            let that = this

            //draw trans.
            console.log(trans)
            let trans_values = Object.values(trans)
            let data = Object.keys(trans).filter(item=>{
                if(trans[item].length>10){
                    return true
                }}).sort(function(a,b){
                    return trans[a].length-trans[b].length
                })
                .map(item=>[item,trans[item]])
            console.log(data)
            let transLen = data.length
            let x_scale = d3.scaleTime()
                            .domain([new Date(2021,4,1,0),new Date(2022,6,1,0)]).range([that.margin.left,that.svgWidth-that.margin.right])
            let y_scale = d3.scaleLinear().domain([0,transLen]).range([that.margin.top,that.svgHeight/3])
            let color_scale = d3.scaleLinear().domain([0,150]).range(['white','red'])
            // console.log('time',x_scale(new Date(2021,0,1)),this.timeParser('2021-05-08T22:28:04.000Z'),x_scale(this.timeParser('2021-05-08T22:28:04.000Z')))
            svg.selectAll('g.token')
                .data(data)
                .join("g").classed("token",true)
                .each(function(ddd,index){
                    let id = ddd[0]
                    d3.select(this).selectAll(`circle.token${id}`)
                        .data(ddd[1])
                        .join('circle')
                        .classed(`token${id}`,true)
                            .attr('cx',d=>x_scale(that.timeParser(d['time_stamp'])))
                            .attr('cy',y_scale(index))
                            .attr('r',1)
                            .attr("fill",d=>{
                                if(d['status']=='Sale'){
                                    return color_scale(d['value'])
                                }else{
                                    return 'none'
                                }
                            })
                            .attr("stroke",d=>{
                                if(d['back_check']==true){
                                    if(d['status']=='Sale'){
                                        return 'blue'
                                    }else{
                                        return 'blue'
                                    }
                                    
                                }else{
                                    return 'none'
                                }
                            })
                            .attr('stroke-width',0.1)
                })

        },
        timeParser(t){
            let timestring = d3.timeParse("%Y-%m-%dT%H:%M:%S.000Z")
            return timestring(t)
        },
    },
    created(){
    },
    mounted(){
        window.addEventListener("resize",this.setSvg);
        this.setSvg()
    },
    updated(){
    },
    unmounted(){
        window.removeEventListener("resize",this.setSvg)
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