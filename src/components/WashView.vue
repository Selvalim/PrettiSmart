<template>
    <div style="height:100%;width:100%;background:white" ref="container" class="display-flex">
        <!-- <div class="view_title" style="margin-left:-12px;margin-top:-11px;height:55px;width:30.2%;
        background:#e9ecef;position: absolute;font: 1.5em sans-serif;padding-left: 10px;text-align: left;font-weight: 600;border-radius: 5px;">
            NFT Disk
        </div> -->
        <!-- <div class="view_title" style="margin-left:29.8%;margin-top:-11px;height:25px;width:68.7%;
        background:#e9ecef;position: absolute;font: 1.4em sans-serif;text-align:center;font-weight: 600;border-radius: 5px;">
            NFT Flow View 0 100 260 395 505 600 860
        </div> 1190 1290 1450 1585 1695 1790 2050-->
        <!-- <div class="view_title" style="margin-left:-20px;margin-top:750px;height:15px;width:109%;
        background:#2f3542;position: absolute;font: 1.5em sans-serif;text-align:center;">
        </div> -->
        <div class="tooltip">
               <p>111</p>
        </div>
        <div style="margin-top:0px;position: absolute;margin-left: 1490px"><p class="control">Background:</p> </div>
        <div style="height: 50;width:150px;margin-top:-2px;position: absolute;margin-left: 1590px;">
            <n-select size="small" v-model:value="bg_result" :options="bg_options" />
        </div>
        <div style="margin-top:0px;position: absolute;margin-left:1750px"><p class="control">Address Filtering:</p></div>
        <div style="height: 50;width:100px;margin-top:-2px;position: absolute;margin-left: 1885px;">
            <n-input-number size="small" v-model:value="trans_threshold"/>
        </div>
        <div style="margin-top:0px;position: absolute;margin-left:1995px"><p class="control">Time Range:</p> </div>
        <div style="height: 50;width:250px;margin-top:-2px;position: absolute;margin-left: 2090px;">
            <n-date-picker size="small" v-model:value="range" type="daterange"/>
        </div>
        <div style="height: 50;width:100px;margin-top:-2px;position: absolute;margin-left:2350px;">
                <n-button size="small" strong secondary round @click="reset_view">
                <p class="control">Reset</p>
                </n-button>
        </div>

        <svg class="main" :height="this.svgHeight" :width="this.svgWidth"></svg>             
    </div>
</template>

<script>
import {NInputNumber,NButton,NDatePicker,NSwitch,NSelect,NCard} from 'naive-ui'
import * as d3 from "d3"
// import All_events from "../assets/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D-0-1000-all-events.json"
// import All_connections from "../assets/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D-0-1000-all-connections-1.json"
// import All_Trans from "../assets/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D-new-new-trans.json"
// import Check_list from "../assets/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D-contract-list.json"
// import Address_statistic from "../assets/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D-address-statistic.json"
// import All_Trans from "../assets/0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7-new-new-trans.json"

//  //Meebits:
import Check_list from "../assets/Meebits/0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7-contract-list.json"
import Leaf_order from "../assets/Meebits/0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7-leaf-order-max-single.json"
import Cut_time from "../assets/Meebits/0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7-new-cut-time.json"
import Con_sta from "../assets/Meebits/0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7-connection_sta.json"
import M_price from "../assets/Meebits/0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7-month-price.json"
import M_trans from "../assets/Meebits/0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7-month-trans.json"

// BAYC
// import Check_list from "../assets/BAYC/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D-contract-list.json"
// import Leaf_order from "../assets/BAYC/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D-leaf-order-max-single.json"
// import Cut_time from "../assets/BAYC/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D-new-cut-time.json"
// import Con_sta from "../assets/BAYC/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D-connection_sta.json"
// import M_price from "../assets/BAYC/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D-month-price.json"
// import M_trans from "../assets/BAYC/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D-month-trans.json"

//CPUNK
// import Check_list from "../assets/CPunk/0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB-contract-list.json"
// import Leaf_order from "../assets/CPunk/0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB-leaf-order-max-single.json"
// import Cut_time from "../assets/CPunk/0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB-new-cut-time.json"
// import Con_sta from "../assets/CPunk/0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB-connection_sta.json"
// import M_price from "../assets/CPunk/0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB-month-price.json"
// import M_trans from "../assets/CPunk/0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB-month-trans.json"

//Azuki
// import Check_list from "../assets/Azuki/0xED5AF388653567Af2F388E6224dC7C4b3241C544-contract-list.json"
// import Leaf_order from "../assets/Azuki/0xED5AF388653567Af2F388E6224dC7C4b3241C544-leaf-order-max-single.json"
// import Cut_time from "../assets/Azuki/0xED5AF388653567Af2F388E6224dC7C4b3241C544-new-cut-time.json"
// import Con_sta from "../assets/Azuki/0xED5AF388653567Af2F388E6224dC7C4b3241C544-connection_sta.json"
// import M_price from "../assets/Azuki/0xED5AF388653567Af2F388E6224dC7C4b3241C544-month-price.json"
// import M_trans from "../assets/Azuki/0xED5AF388653567Af2F388E6224dC7C4b3241C544-month-trans.json"

//Moon Birds 0x23581767a106ae21c074b2276d25e5c3e136a68b
// import Check_list from "../assets/Mbirds/0x23581767a106ae21c074b2276d25e5c3e136a68b-contract-list.json"
// import Leaf_order from "../assets/Mbirds/0x23581767a106ae21c074b2276d25e5c3e136a68b-leaf-order-max-single.json"
// import Cut_time from "../assets/Mbirds/0x23581767a106ae21c074b2276d25e5c3e136a68b-new-cut-time.json"
// import Con_sta from "../assets/Mbirds/0x23581767a106ae21c074b2276d25e5c3e136a68b-connection_sta.json"
// import M_price from "../assets/Mbirds/0x23581767a106ae21c074b2276d25e5c3e136a68b-month-price.json"
// import M_trans from "../assets/Mbirds/0x23581767a106ae21c074b2276d25e5c3e136a68b-month-trans.json"

//Loot
// import Check_list from "../assets/Loot/0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7-contract-list.json"
// import Leaf_order from "../assets/Loot/0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7-leaf-order-max-single.json"
// import Cut_time from "../assets/Loot/0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7-new-cut-time.json"
// import Con_sta from "../assets/Loot/0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7-connection_sta.json"
// import M_price from "../assets/Loot/0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7-month-price.json"
// import M_trans from "../assets/Loot/0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7-month-trans.json"

//Cheers
// import Check_list from "../assets/Cheers/0xa5Bb28eecC6134F89745E34ec6aB5d5Bcb16dAD7-contract-list.json"
// import Leaf_order from "../assets/Cheers/0xa5Bb28eecC6134F89745E34ec6aB5d5Bcb16dAD7-leaf-order-max-single.json"
// import Cut_time from "../assets/Cheers/0xa5Bb28eecC6134F89745E34ec6aB5d5Bcb16dAD7-new-cut-time.json"
// import Con_sta from "../assets/Cheers/0xa5Bb28eecC6134F89745E34ec6aB5d5Bcb16dAD7-connection_sta.json"
// import M_price from "../assets/Cheers/0xa5Bb28eecC6134F89745E34ec6aB5d5Bcb16dAD7-month-price.json"
// import M_trans from "../assets/Cheers/0xa5Bb28eecC6134F89745E34ec6aB5d5Bcb16dAD7-month-trans.json"


//Soulda
// import Check_list from "../assets/soulda/0xe361f10965542ee57D39043C9c3972B77841F581-contract-list.json"
// import Leaf_order from "../assets/soulda/0xe361f10965542ee57D39043C9c3972B77841F581-leaf-order-max-single.json"
// import Cut_time from "../assets/soulda/0xe361f10965542ee57D39043C9c3972B77841F581-new-cut-time.json"
// import Con_sta from "../assets/soulda/0xe361f10965542ee57D39043C9c3972B77841F581-connection_sta.json"
// import M_price from "../assets/soulda/0xe361f10965542ee57D39043C9c3972B77841F581-month-price.json"
// import M_trans from "../assets/soulda/0xe361f10965542ee57D39043C9c3972B77841F581-month-trans.json"

export default {
    name:"WashView",
    components:{ NInputNumber,NButton ,NDatePicker,NSwitch,NSelect,NCard},
    props:[],
    data(){
        return {
            range:[1619798400000,1656604800000],
            trans_threshold:20,
            bg_result:1,
            bg_options:[{label:"Average Price",value:1},{label:"Transaction Volume",value:2}],
            legends:{},
            circle_config:[],
            svgHeight:'0',
            svgWidth:'0',
            margin:{top:0,left:0,right:5},
            oneNFT:{x:60,y:200,height:300},
            //data load
            // AllConnections: JSON.parse(JSON.stringify(All_connections)),
            // AllEvents: JSON.parse(JSON.stringify(All_events)),
            // AllTrans: JSON.parse(JSON.stringify(All_Trans)),
            // AddressStatistic: JSON.parse(JSON.stringify(Address_statistic)),
            CheckList: JSON.parse(JSON.stringify(Check_list)),
            LeafOrder: JSON.parse(JSON.stringify(Leaf_order)),
            CutTime: JSON.parse(JSON.stringify(Cut_time)),
            ConSta: JSON.parse(JSON.stringify(Con_sta)),
            MTrans: JSON.parse(JSON.stringify(M_trans)),
            MPrice: JSON.parse(JSON.stringify(M_price)),
            //parameters
            // mode: 'trans-order', // real-time or trans order
            // trans_blocks:[],//trans id : block number {1:13241452,2:211241}
            // trans_date:[],// trans id : real trans timestamp
            // connection_groups:{},//interval id: {c20:[tran0,tran1],c721:[tran0,...], cnormal:[...]}
            // time_interval:{},// interval id : {ms:,s:,m:,h:,d:,...}
            // time_threshold:60,
            // interval_list:[],//interval id: {id,group_id,loc,offset,width}
            // interval_groups:[],//group id: {group_id,group_loc,group_count,group_width,group_timecount,group_timeloc}
            // matrix_data:{},//{c_20,c_721,c_normal,combine}
            // // start_date:new Date(2021,4,1,0),
            // // end_date:new Date(2022,6,1,0),
            detail_loc:[],
            path_width:0,
            color_scheme:{
                trans_line:"#f5e889",//,
                sale_line:'#b4d9ab',
                bg_color:["#dbe4ff","#757cbb"],//["#edf2ff","#748cab"],//["#dbe4ff","#757cbb"], //["#f5e4f8","#a177b3"],//['#e6ddd7','#594c57'],
                address_line:'white',
                brush_area:"white",
                brush_connection:['#c4b69e',"#756f64"],
                brush_con:"#adb5bd",
                // flow_line:["#66c2a5","#ed6d3d","#8597bf","#e78ac3","#a6d854","#ffd92f","#fb8072","#6a3d9a","#7fc97f","#80b1d3","#c4b195"],
                // flow_line:["#66c2a5","#ed6d3d","#8597bf","#e78ac3","#ffd92f","#a6d854","#bc80bd","#80b1d3","#f6ad49","#ba8c71","#a6c48a"],
                // flow_line:["#b5d4cb","#fdcdac","#cbd5e8","#f1bbdc","#bad888","#b3cde3","#ffd294","#decbe4","#fbb4ae","#e5c494","#b1c49f","#f6cc94","#ba9680"],
                flow_line:["#92b0a6","#c19b82","#a7b0c1","#c2a6b5","#8fac74","#9ab3bf","#d9d18d","#b1a0b7","#c99f9b","#cfbc98","#b1c49f","#bb9973","#baa08d"],
                high_flow_line:"#7d5284",
                flow_bg:"#748ffc",//'#9d9ac8',
                o_flow:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#fb9a99","#cab2d6","#b2df8a","#a6cee3"],//[...d3.schemePastel2],
                o_text:"white",
                inner_line:'#757cbb',
                boarder_line:"#dee2e6",
                brush_boarder:"#dee2e6"//'#775039'

            }
        }
    },
    computed:{
    },
    watch:{
        bg_result:function(value){
            let key
            if(value==1){
                key = 'price'
            }else if(value==2){
                key = 'volume'
            }            
            let data = this.legends[key]
            let CX = this.circle_config[0]
            let CY = this.circle_config[1]
            let R = this.circle_config[2]
            d3.select('circle.bg')
                    .attr('fill',`url(#${key})`)

            let legend_G = d3.select('g.legend_G')            
            let legend_x = 0,legend_y= 16,h = 18
            let rect_x = value==1?legend_x+170:legend_x+200
            legend_G.selectAll('text.legend').remove()
            legend_G.select('rect.legend').remove()

            legend_G.append('text').classed('legend',true)
                .attr('x',legend_x).attr('y',legend_y)
                .text(data[0]).attr("fill","#606e79").attr('font-size',"15px").attr("font-weight",600)
            legend_G.append("rect").classed('legend',true)
                .attr('x',rect_x).attr('y',legend_y-14)
                .attr('width',150).attr('height',h)
                .attr("fill",`url(#legend)`)
            legend_G.append('text').classed('legend',true)
                .attr('x',rect_x-5).attr('y',legend_y).attr('font-size',"15px").attr("font-weight",600)
                .attr('text-anchor','end').attr("fill","#606e79")
                .text(`(${data[1]})`)
            legend_G.append('text').classed('legend',true)
                .attr('x',rect_x+155).attr('y',legend_y).attr('font-size',"15px").attr("font-weight",600)
                .text(`(${data[2]})`).attr("fill","#606e79")
        }
    },
    methods:{
        reset_view(){
            this.drawInit()
        },
        setSvg(){
            if(this.$refs.container.offsetHeight){
                this.svgHeight = this.$refs.container.offsetHeight;                
            }
            if(this.$refs.container.offsetWidth){
                this.svgWidth = this.$refs.container.offsetWidth;            
            }
            console.log("this.svy",this.$refs.container.offsetHeight,this.svgHeight,this.svgWidth)
            console.log("checkkkkkkkk  ", this.ConSta,this.CheckList)
            this.drawInit()
        },
        drawInit(){
            // let token_id = '465'
            // let events = this.AllEvents[token_id]
            // let connections = this.AllConnections[token_id]
            // console.log('events',events)
            // this.getTransBlocks(events['trans'])
            // this.groupConnections(events['trans'],connections)
            // this.groupTimeInterval()
            // this.generateMatrixData()
            // this.drawOneNFT(0,200,events,connections)
            this.drawNFTFlow(10,0,this.CheckList,this.CutTime)
            // svg.append("g").append("circle").attr("cx",500).attr("cy",500).attr("r",20).attr("fill",'red')
        },
        //draw one NFT charts:
        drawOneNFT(x,y,events,connections){
            d3.select("g.One").remove()
            d3.select("g.connections").remove()
            d3.select('g.timeInterval').remove()
            d3.select("g.boarderLine").remove()
            d3.select('g.price').remove()
            d3.select('g.circle').remove()
            d3.select('g.angle_path').remove()
            d3.select('g.price_angle').remove()
            d3.select('g.price_circle').remove()
            d3.select('g.grid').remove()
            d3.select('g.time_distortion').remove()
            d3.select('g.matrix').remove()

            let that = this
            console.log(this.interval_groups)
            let width = that.svgWidth - that.margin.left - that.margin.right
            let height = that.oneNFT.height
            //get the svg
            let svg = d3.select("svg.main")
                    .attr("width",that.svgWidth)
                    .attr("height",that.svgHeight)


            let OwnerOrder = that.getOwnerOrder(events['trans'])
            let OwnerLen = OwnerOrder.length
            let TransLen = events["trans"].length
            let scaleY = d3.scaleLinear()
                            .domain([0,OwnerLen+1]).range([y,y+height])
            let scaleX
            if(that.mode == 'trans-order'){
                //for trans order
                scaleX = d3.scaleLinear()
                            .domain([-1,TransLen+1]).range([that.margin.left,width-that.margin.right])
            }else if(that.mode == 'real-time'){
                //for real time
                scaleX = d3.scaleTime()
                            .domain([new Date(2021,0,1,0),new Date(2022,6,1,0)]).range([that.margin.left,width-that.margin.right])
            }
            //interval distortino
            this.generate_interval_list(scaleX,events['trans']) //do not need 
            //draw background grid
            that.drawGrid(svg,scaleX,scaleY,OwnerOrder,events['trans'],that.time_threshold)
            that.drawTimeDistortion(svg,scaleX,scaleY,events['trans'],that.time_interval,that.interval_groups,that.time_threshold)

            //draw boarder line
            that.drawBoarderLine(svg,scaleX,scaleY,OwnerOrder,events['trans'])
            //draw time interval
            // that.drawTimeInterval(svg,scaleX,scaleY,OwnerOrder,events['trans'])

            //draw the price deviation
            // that.drawPrice(svg,scaleX,scaleY,events['trans'])


            //draw trade path
            // let one_G = svg.append("g").classed("One",true)
            // let Path = that.getTradePath(scaleX,scaleY,OwnerOrder,events['trans'])
            //draw path
            // one_G.append('path')
            //     .attr("d",()=>{
            //         return Path + `H ${scaleX(0)} z`
            //     })
            //     .attr("stroke",'gray')
            //     .attr("fill","#efefef")
            //     .attr("stroke-width",0)

            // one_G.append('path')
            //     .attr("d",Path)
            //     .attr("stroke",'gray')
            //     .attr("fill","none")
            //     .attr("stroke-width",2)        
            
            //draw angle price
            // that.drawPriceAngle(svg,scaleX,scaleY,OwnerOrder,events['trans'])

            // draw other assets connections
            // that.drawConnections(svg,scaleX,scaleY,OwnerOrder) 
            that.drawArcConnections(svg,scaleX,scaleY,OwnerOrder)
            //draw circle price
            that.drawPriceCircle(svg,scaleX,scaleY,OwnerOrder,events['trans'])
            //draw angle trade path
            that.drawAnglePath(svg,scaleX,scaleY,OwnerOrder,events['trans'])
            //draw the circle
            that.drawCircle(svg,scaleX,scaleY,OwnerOrder,events['trans'],events['unique_non_contract'])


            //draw the matrix
            let start_X = width-that.margin.right
            that.drawMatrix(svg,start_X,scaleY,OwnerOrder,this.matrix_data,events['trans'])
        },
        getOwnerOrder(trans){
            let OwnerOrder = []
            let data = JSON.parse(JSON.stringify(trans)).reverse()
            data.forEach((item)=>{
                if(OwnerOrder.indexOf(item['to_address'])==-1){
                    OwnerOrder.push(item['to_address'])
                }
                if(OwnerOrder.indexOf(item['from_address'])==-1){
                    OwnerOrder.push(item['from_address'])
                }
            })
            return OwnerOrder
        },
        getTradePath(scaleX,scaleY,OwnerOrder,trans){
            let data = JSON.parse(JSON.stringify(trans)).reverse()
            let Path
            if(this.mode == 'trans-order'){
                //for trans order
                let intervalX = scaleX(1)-scaleX(0)
                Path = `M ${scaleX(0)} ${scaleY(OwnerOrder.indexOf(data[0]['to_address']))} `
                data.forEach((item,index)=>{
                    let startY = scaleY(OwnerOrder.indexOf(item['to_address']))
                    let endY = scaleY(OwnerOrder.indexOf(item['from_address']))
                    if(index==0){
                        Path += `v ${endY-startY}`
                    }else{
                        Path += `h ${intervalX} v ${endY-startY}`                        
                    }
                })
            }else if(this.mode == 'real-time'){
            //for real time
                Path = `M ${scaleX(this.timePaser(data[0]['logs']['block_timestamp']))} ${scaleY(OwnerOrder.indexOf(data[0]['to_address']))} `
                data.forEach((item,index)=>{
                    let startY = scaleY(OwnerOrder.indexOf(item['to_address']))
                    let endY = scaleY(OwnerOrder.indexOf(item['from_address']))
                    let X = scaleX(this.timePaser(item['logs']['block_timestamp']))
                    Path += `H ${X} v ${endY-startY} `
                })                
            }
            return Path
        },
        timePaser(t){
            let timestring = d3.timeParse("%Y-%m-%dT%H:%M:%S.000Z")
            return timestring(t)
        },
        getTransBlocks(trans){
            let data = JSON.parse(JSON.stringify(trans)).reverse()
            let trans_blocks = []
            let trans_date = []
            data.forEach(item=>{
                trans_blocks.push(parseInt(item['logs']['block_number']))
                trans_date.push(this.timePaser(item['logs']['block_timestamp']))
            })
            this.trans_blocks = trans_blocks
            this.trans_date = trans_date
        },
        groupConnections(trans,connections){
            console.log(trans)
            let trans_blocks = this.trans_blocks
            let intervals = [...Array(trans_blocks.length+1).keys()]
            let scale_group = d3.scaleThreshold()
                                .domain(trans_blocks).range(intervals)

            let trans_list = trans.map(item=>item['transaction_hash'])//去重
            
            let group_dict = {}
            intervals.forEach(item=>{
                group_dict[item] = {
                    'c_20':[],
                    "c_721":[],
                    "c_normal":[],
                    "combine":[]
                }
            })
            if(connections['connections_20'].length>0){
                connections["connections_20"].forEach(item=>{
                    if(trans_list.indexOf(item['hash'])==-1){
                        let interval = scale_group(item['blockNumber'])
                        group_dict[interval]['c_20'] = [...group_dict[interval]['c_20'],item]
                        group_dict[interval]['combine'] = [...group_dict[interval]['combine'],item] 
                    }

                })                
            }
            if(connections['connections_721'].length>0){
                connections["connections_721"].forEach(item=>{
                    if(trans_list.indexOf(item['hash'])==-1){
                        let interval = scale_group(item['blockNumber'])
                        group_dict[interval]['c_721'] = [...group_dict[interval]['c_721'],item]
                        group_dict[interval]['combine'] = [...group_dict[interval]['combine'],item]
                    }
                })                
            }
            if(connections['connections_normal'].length>0){
                connections["connections_normal"].forEach(item=>{
                    if(trans_list.indexOf(item['hash'])==-1){
                        let interval = scale_group(item['blockNumber'])
                        group_dict[interval]['c_normal'] = [...group_dict[interval]['c_normal'],item]
                        group_dict[interval]['combine'] = [...group_dict[interval]['combine'],item]
                    }
                })                
            }
            this.connection_groups = group_dict
        },
        drawArcConnections(svg,scaleX,scaleY,OwnerOrder){
            let that = this
            //draw connections:
            let connection_G = svg.append('g').classed("connections",true)
            let x_interval = scaleX(1)-scaleX(0)
            let arc_generate = (loc,start,end)=>{
                let y1 = scaleY(start), y2 = scaleY(end)
                let ry = Math.abs(y2-y1)/2
                let max_rx = (scaleX(1)-scaleX(0))*0.8
                let arc_rate = 0.5
                let rx = ry*arc_rate<max_rx?ry*arc_rate:max_rx
                let d = `M ${loc} ${y1}`
                d += `A ${rx} ${ry} ${0} ${0} ${1} ${loc} ${y2}`
                return d
            }
            let line_generate = (loc,start,end,index,link_number)=>{
                let edge_interval = x_interval/(link_number+1)
                let y1 = scaleY(start), y2 = scaleY(end)
                let x = loc + (index+1)*edge_interval
                let d = `M ${x} ${y1} L ${x} ${y2}`
                return [d,x,y1,y2]
            }
            let groups = that.connection_groups
            console.log(groups)
            let group_links = {}
            let max_weight = 1
            Object.keys(groups).forEach((index)=>{
                let sub_group = groups[index]
                let new_links = {}
                if(sub_group['combine'].length>0){
                    sub_group['combine'].forEach((item,s_index)=>{
                        let start = OwnerOrder.indexOf(item['from'])
                        let end = OwnerOrder.indexOf(item['to'])
                        let is_exist1 = `${start}-${end}` in new_links
                        let is_exist2 = `${end}-${start}` in new_links
                        if(is_exist1){
                            new_links[`${start}-${end}`] = new_links[`${start}-${end}`]+1
                        }else if(is_exist2){
                            new_links[`${end}-${start}`] = new_links[`${end}-${start}`]+1
                        }else{
                            if(start<end){
                                new_links[`${start}-${end}`] = 1
                            }else{
                                new_links[`${end}-${start}`] = 1
                            }
                        }
                    })
                    let current_max = Math.max(...Object.values(new_links))
                    if(current_max>max_weight){
                        max_weight = current_max
                    }
                    group_links[index] = new_links                       
                }
            })
            console.log(max_weight,group_links)
            let weight_scale = d3.scaleLinear().domain([1,max_weight]).range([1.5,x_interval*0.2])
            Object.keys(group_links).forEach((key,index)=>{
                let loc = scaleX(key-1)
                let links = group_links[key]
                let link_number = Object.keys(links).length
                Object.keys(links).forEach((link,l_index)=>{
                    let start = link.split('-')[0]
                    let end = link.split('-')[1]
                    let weight = links[link]
                    // console.log(start,end,weight,arc_generate(loc,start,end))
                    //draw ARC edges
                    // connection_G.append("path").classed('connections',true)
                    //     .attr('d',arc_generate(loc,start,end))
                    //     .attr('stroke-width',weight_scale(weight))
                    //     .attr('stroke','#6e9bc5')
                    //     .attr('fill','none')
                    //draw straight edges
                    let line_data = line_generate(loc,start,end,l_index,link_number)
                    connection_G.append("path").classed('connections',true)
                        .attr('d',line_data[0])
                        .attr('stroke-width',1.2)
                        .attr('stroke','#6e9bc5')
                        .attr('fill','none')
                    let circle_r = 1.2
                    connection_G.append('circle').classed('connections',true)
                        .attr('cx',line_data[1])
                        .attr('cy',line_data[2])
                        .attr('r',circle_r)
                        .attr('fill','#6e9bc5')
                        .attr('stroke','white')
                        .attr('stroke-width',0.5)
                    connection_G.append('circle').classed('connections',true)
                        .attr('cx',line_data[1])
                        .attr('cy',line_data[3])
                        .attr('r',circle_r)
                        .attr('fill','#6e9bc5')
                        .attr('stroke','white')
                        .attr('stroke-width',0.5)
                })
            })
        },
        drawConnections(svg,scaleX,scaleY,OwnerOrder){
            let that = this
            //draw connections:
            let connection_G = svg.append('g').classed("connections",true)
            let groups = that.connection_groups
            Object.keys(groups).forEach(item=>{
                let combineLen = groups[item]['combine'].length
                if(combineLen>0){
                    let interval_scale = d3.scaleLinear().domain([-2,combineLen+1]).range([scaleX(item-1),scaleX(item)])
                    let interval_width = interval_scale(1)-interval_scale(0)
                    let connection_width = ((interval_width)>1.5?1.5:interval_width)*0.9
                    let connection_opacity = 0.8
                    let combine = groups[item]['combine'].sort((a,b)=>{
                        // return parseInt(a['blockNumber'])-parseInt(b['blockNumber'])
                        return parseInt(a['timeStamp'])-parseInt(b['timeStamp'])
                    }).map(item=>item['hash'])
                    //draw other connections
                    let interval_G = connection_G.append('g').classed(`interval${item}`,true)
                    if(groups[item]['c_20'].length>0){
                        interval_G.selectAll("path.c_20")
                            .data(groups[item]['c_20'])
                            .join('path').classed('c_20',true)
                            .attr("d",d=>{
                                let x = interval_scale(combine.indexOf(d['hash']))
                                let y1 = scaleY(OwnerOrder.indexOf(d['from']))
                                let y2 = scaleY(OwnerOrder.indexOf(d['to']))
                                let e = `M ${x} ${y1} V ${y2}`
                                return e
                            })
                            .attr("stroke",'#84a729')
                            .attr("stroke-width",connection_width)
                            .attr('fill','none')     
                            .attr("opacity",connection_opacity)                   
                    }
                    if(groups[item]['c_721'].length>0){
                        interval_G.selectAll("path.c_721")
                            .data(groups[item]['c_721'])
                            .join('path').classed('c_721',true)
                            .attr("d",d=>{
                                let x = interval_scale(combine.indexOf(d['hash']))
                                let y1 = scaleY(OwnerOrder.indexOf(d['from']))
                                let y2 = scaleY(OwnerOrder.indexOf(d['to']))
                                let e = `M ${x} ${y1} V ${y2}`
                                return e
                            })
                            .attr("stroke",'#5976ba')
                            .attr("stroke-width",connection_width)
                            .attr('fill','none')        
                            .attr("opacity",connection_opacity)                   
                    }
                    if(groups[item]['c_normal'].length>0){
                        interval_G.selectAll("path.c_normal")
                            .data(groups[item]['c_normal'])
                            .join('path').classed('c_normal',true)
                            .attr("d",d=>{
                                let x = interval_scale(combine.indexOf(d['hash']))
                                let y1 = scaleY(OwnerOrder.indexOf(d['from']))
                                let y2 = scaleY(OwnerOrder.indexOf(d['to']))
                                let e = `M ${x} ${y1} V ${y2}`
                                return e
                            })
                            .attr("stroke",'#c12c1f')
                            .attr("stroke-width",connection_width)
                            .attr('fill','none')           
                            .attr("opacity",connection_opacity)                
                    }

                }

            })

        },
        groupTimeInterval(){ //获得时间间隔
            let time_interval = {}
            let trans_date = this.trans_date
            let transLen = trans_date.length
            let current_trans = 1
            while(current_trans<transLen){
                let interval = trans_date[current_trans].getTime() - trans_date[current_trans-1].getTime()
                time_interval[current_trans] = {
                    'ms' : interval,
                    's' : parseInt(interval/1000),
                    "m" : parseInt(interval/(1000*60)),
                    "h" : parseInt(interval/(1000*3600)),
                    "d" : parseInt(interval/(1000*3600*24))

                }
                current_trans += 1
            }
            this.time_interval = time_interval
        },
        drawTimeInterval(svg, scaleX, scaleY, OwnerOrder,trans){
            let that = this
            let new_trans = JSON.parse(JSON.stringify(trans)).reverse()
            //draw connections:
            let timeInterval_G = svg.append('g').classed("timeInterval",true)
            let time_interval = that.time_interval
            let interval_width = scaleX(1)-scaleX(0)
            console.log(time_interval)
            let interval_color = (obj)=>{
                if(obj['d']>0){
                    return 'none'
                }else if(obj['h']>0){
                    return 'none'
                }else if(obj['m']>0){
                    return '#ffcdd2'
                }else{
                    return '#ffc9c9'
                }
            }
            let startY = (index)=>{
                let to_index = OwnerOrder.indexOf(new_trans[index]['to_address'])
                let from_index = OwnerOrder.indexOf(new_trans[index]['from_address'])
                let start = to_index>from_index?from_index:to_index
                let end = to_index<from_index?from_index:to_index
                let startY = scaleY(start)
                let height = scaleY(end)-scaleY(start)
                return [startY,height]
            }
            
            timeInterval_G.selectAll('rect.timeInterval')
                .data(Object.keys(time_interval))
                .join("rect").attr('class',d=>`interval${d}`).classed('timeInterval',true)
                .attr('x',d=>scaleX(d-1))
                .attr('y',d=>startY(d)[0])
                .attr("width",interval_width)
                .attr('height',d=>startY(d)[1])
                .attr('fill',d=>interval_color(time_interval[d]))
                .attr('opacity',0.5)
        },
        drawBoarderLine(svg, scaleX, scaleY, OwnerOrder, trans){
            let that = this
            //draw boarderLine:
            let interval_height = scaleY(OwnerOrder.length-1)-scaleY(0)
            let start_x = scaleX(0)-1,start_x0 = scaleX(-1)
            let end_x = scaleX(trans.length-1)+1,end_x0 = scaleX(trans.length)
            let boarderLine_G = svg.append('g').classed("boarderLine",true)
            // boarderLine_G.append('line').classed('boarderLine',true)
            //     .attr('x1',start_x)
            //     .attr('x2',start_x)
            //     .attr('y1',scaleY(0))
            //     .attr('y2',scaleY(0)+interval_height)
            //     .attr('stroke','black')
            //     .attr('stroke-width','1')
            //     .attr('opacity',0.5)
            // boarderLine_G.append('line').classed('boarderLine',true)
            //     .attr('x1',end_x)
            //     .attr('x2',end_x)
            //     .attr('y1',scaleY(0))
            //     .attr('y2',scaleY(0)+interval_height)
            //     .attr('stroke','black')
            //     .attr('stroke-width','1')
            //     .attr('opacity',0.5)

            //external
            boarderLine_G.append('line').classed('boarderLine',true)
                .attr('x1',start_x0)
                .attr('x2',start_x0)
                .attr('y1',scaleY(0))
                .attr('y2',scaleY(0)+interval_height)
                .attr('stroke','black')
                .attr('stroke-width','2')
            boarderLine_G.append('line').classed('boarderLine',true)
                .attr('x1',end_x0)
                .attr('x2',end_x0)
                .attr('y1',scaleY(0))
                .attr('y2',scaleY(0)+interval_height)
                .attr('stroke','black')
                .attr('stroke-width','2')
        },
        drawPrice(svg, scaleX, scaleY, trans){
            let that = this
            let price_height = 80
            let data = JSON.parse(JSON.stringify(trans)).reverse()
            let trans_list = data.map(item=>item['transaction_hash'])
            let max_price = d3.max(data.filter(item=>item['status']=="Sale").map(item=>item['value']))
            //draw price:
            let price_G = svg.append('g').classed("price",true)
            let price_scale = d3.scaleLinear()
                    .domain([max_price,0]).range([scaleY(0)-price_height-10,scaleY(0)-10])
            //draw below linwe
            price_G.append('line').classed('price',true)
                .attr('x1',scaleX(-1)).attr('x2',scaleX(trans.length-1))
                .attr('y1',price_scale(0)+0.5).attr("y2",price_scale(0)+0.5)
                .attr('stroke-width',1).attr("stroke",'black')
            //draw waterfall plot
            let last_price = 0
            let current_interval = 0
            let price_path = `M${scaleX(-1)} ${price_scale(0)} `
            let path_width = 0.5
            let x_interval = scaleX(1)-scaleX(0)
            let y_interval = price_scale(1)-price_scale(0)
            while (current_interval < trans.length){
                if(data[current_interval]['status']=="Transfer"){
                    price_path += `h ${x_interval}`
                    price_G.append("rect").classed('price',true)
                        .attr('x',scaleX(current_interval-1))
                        .attr('y',price_scale(last_price)-1)
                        .attr('width',x_interval)
                        .attr('height',1)
                        .attr('fill',"black")
                }else if(data[current_interval]['status']=="Sale"){
                    let current_price = data[current_interval]['value']
                    let price_deviation = current_price - last_price
                    price_path += `v ${price_deviation*y_interval} h ${x_interval}`
                    price_G.append("rect").classed('price',true)
                        .attr('x',scaleX(current_interval-1))
                        .attr('y',d=>{
                            // if(price_deviation>0){
                            //     return price_scale(Math.max(current_price,last_price))+path_width/2
                            // }else if(price_deviation<0){
                            //     return price_scale(Math.max(current_price,last_price))-path_width/2
                            // }else{
                            //     return price_scale(Math.max(current_price,last_price))
                            // }
                            return price_scale(Math.max(current_price,last_price))
                        })
                        .attr('width',x_interval)
                        .attr('height',Math.abs(price_deviation*y_interval))
                        .attr('fill',price_deviation>0?'#40c057':"#ff6b6b")

                    last_price = current_price
                }
                current_interval += 1
            }
            //draw path line
            // price_G.append('path').classed('price',true)
            //     .attr('d',price_path)
            //     .attr('stroke-width',path_width)
            //     .attr('stroke','black')
            //     .attr('fill','none')
            //     .attr('opacity',0.5)
        },
        drawCircle(svg,scaleX,scaleY,OwnerOrder,trans,non_contract){
            let data = JSON.parse(JSON.stringify(trans)).reverse()
            let circle_G = svg.append('g').classed('circle',true)
            let r = 2.5 ,stroke_width = 0.7
            let fill_check = (addr)=>{
                if(non_contract.indexOf(addr)!=-1){
                    return 'black'
                }else{
                    return 'white'
                }
            }
            let stroke_check = (addr)=>{
                if(non_contract.indexOf(addr)!=-1){
                    return 'white'
                }else{
                    return 'grey'
                }
            }
            data.forEach((item,index)=>{
                circle_G.append('circle').classed('circle',true)
                    .attr('cx',scaleX(index))
                    .attr('cy',scaleY(OwnerOrder.indexOf(item['from_address'])))
                    .attr('r',r)
                    .attr('fill',fill_check(item['from_address']))
                    .attr('stroke',stroke_check(item['from_address']))
                    .attr('stroke-width',stroke_width)
                circle_G.append('circle').classed('circle',true)
                    .attr('cx',scaleX(index))
                    .attr('cy',scaleY(OwnerOrder.indexOf(item['to_address'])))
                    .attr('r',r)
                    .attr('fill',fill_check(item['to_address']))
                    .attr('stroke',stroke_check(item['to_address']))
                    .attr('stroke-width',stroke_width)
            })
        },
        drawAnglePath(svg,scaleX,scaleY,OwnerOrder,trans){
            let data = JSON.parse(JSON.stringify(trans)).reverse()
            let angle_path_G = svg.append('g').classed('angle_path',true)
            let angle_color = '#5f4321'
            let angle_generation = (start,end,index)=>{
                let loc_start = OwnerOrder.indexOf(start)
                let loc_end = OwnerOrder.indexOf(end)
                let angle_deviation = scaleY(loc_end) - scaleY(loc_start)
                let angle_width = 4
                let angle_d = `M${scaleX(index)-angle_width/2} ${scaleY(loc_start)} h${angle_width}`
                angle_d += `l ${-angle_width/2} ${angle_deviation} z`
                return angle_d
            }
            data.forEach((item,index)=>{
                if(index>0){
                    angle_path_G.append('line').classed('angle_path',true)
                        .attr('x1',scaleX(index-1))
                        .attr('x2',scaleX(index))
                        .attr('y1',scaleY(OwnerOrder.indexOf(item['to_address'])))
                        .attr('y2',scaleY(OwnerOrder.indexOf(item['to_address'])))
                        .attr('stroke',angle_color)
                        .attr('stroke-width',2)
                }
                let angle_d = angle_generation(item['to_address'],item['from_address'],index)
                angle_path_G.append('path').classed('angle_path',true)
                    .attr('d',angle_d)
                    .attr('fill',d=>{
                        if(item['status']=='Transfer'){
                            return 'white'
                        }else if(item['status']=="Sale"){
                            return angle_color
                        }
                    })
                    .attr('stroke',d=>{
                        if(item['status']=='Transfer'){
                            return angle_color
                        }else if(item['status']=="Sale"){
                            return 'white'
                        }
                    })
                    .attr('stroke-width',d=>{
                        if(item['status']=='Transfer'){
                            return 1
                        }else if(item['status']=="Sale"){
                            return 0
                        }
                    })
            })
        },
        drawGrid(svg,scaleX,scaleY,OwnerOrder,trans,time_threshold){
            let that = this
            let data = JSON.parse(JSON.stringify(trans)).reverse()
            let grid_G = svg.append('g').classed('grid',true)
            //traditional grid
            let time_interval = that.time_interval
            let boarder_rate = 0.9
            let current_column = 0
            let transLen = trans.length
            while(current_column<transLen+1){
                let is_link = false
                let is_rapid = false
                if(0<current_column&&current_column<transLen){
                    is_rapid = time_interval[current_column]['m']<time_threshold
                    if(current_column<transLen-1){
                        is_link = (time_interval[current_column]['m']<time_threshold)&&(time_interval[current_column+1]['m']<time_threshold)
                    }
                }
                OwnerOrder.forEach((owner,o_index)=>{
                    if(o_index>0){
                        grid_G.append('rect').classed('gird',true)
                            .attr('x',scaleX(current_column-1)+0.5*(1-boarder_rate)*(scaleX(1)-scaleX(0)))
                            .attr('y',scaleY(o_index-1)+0.5*(1-boarder_rate)*(scaleY(1)-scaleY(0)))
                            .attr('width',is_link?(scaleX(1)-scaleX(0)):boarder_rate*(scaleX(1)-scaleX(0)))
                            .attr('height',boarder_rate*(scaleY(1)-scaleY(0)))
                            .attr('fill',d=>{
                                if(o_index%2>0){
                                    return is_rapid?'#e0e0e0':"#eeeeee"
                                }else{
                                    return 'white'
                                }                              
                            })                        
                    }
                })          
                current_column+=1      
            }

        },
        drawPriceAngle(svg, scaleX, scaleY, OwnerOrder, trans){
            let that = this
            let data = JSON.parse(JSON.stringify(trans)).reverse()
            let trans_list = data.map(item=>item['transaction_hash'])
            let max_price = d3.max(data.filter(item=>item['status']=="Sale").map(item=>item['value']))
            //draw price:
            let price_angle_G = svg.append('g').classed("price_angle",true)
            let price_angle_scale = d3.scaleLinear().domain([0,1]).range([0,scaleY(1)-scaleY(0)])
            let price_scale = d3.scaleLinear().domain([0,max_price]).range([0,(scaleY(1)-scaleY(0))*10])
            //draw price angle
            let last_price = 0
            let current_interval = 0
            let x_interval = scaleX(1)-scaleX(0)
            while (current_interval < trans.length){
                if(data[current_interval]['status']=="Transfer"){

                }else if(data[current_interval]['status']=="Sale"){
                    let current_price = data[current_interval]['value']
                    let price_deviation = current_price - last_price
                    let price_deviation_rate = last_price>0?price_deviation/last_price:0
                    let y_base = scaleY(OwnerOrder.indexOf(data[current_interval]['to_address'])) 
                    let angle_d = `M ${scaleX(current_interval-1)} ${y_base} h ${x_interval} l${-x_interval/2} ${-price_angle_scale(price_deviation_rate)} z`
                    price_angle_G.append("path").classed("price_angle",true)
                        .attr('d',angle_d)
                        .attr('fill',price_deviation>0?'#97b1a1':"#ca9e87")
                        .attr("opacity",0.8)
                    //update last price
                    last_price = current_price
                }
                current_interval += 1
            }
        },
        drawPriceCircle(svg, scaleX, scaleY, OwnerOrder, trans){
            let that = this
            let data = JSON.parse(JSON.stringify(trans)).reverse()
            let trans_list = data.map(item=>item['transaction_hash'])
            let max_price = d3.max(data.filter(item=>item['status']=="Sale").map(item=>item['value']))
            //draw price:
            let price_angle_G = svg.append('g').classed("price_circle",true)
            let price_rate_scale = d3.scaleLinear().domain([0,10]).range([0,scaleY(1)-scaleY(0)])
            let price_scale = d3.scaleLinear().domain([0,max_price]).range([0,(scaleY(1)-scaleY(0))])
            //draw price angle
            let last_price = 0
            let current_interval = 0
            let x_interval = scaleX(1)-scaleX(0)
            while (current_interval < trans.length){
                if(data[current_interval]['status']=="Transfer"){

                }else if(data[current_interval]['status']=="Sale"){
                    let current_price = data[current_interval]['value']
                    let price_deviation = current_price - last_price
                    let price_deviation_rate = last_price>0?price_deviation/last_price:0
                    let y_base = scaleY(OwnerOrder.indexOf(data[current_interval]['to_address'])) 
                    price_angle_G.append("circle").classed("price_circle",true)
                        .attr('cx',scaleX(current_interval))
                        .attr('cy',y_base)
                        .attr('r',3 + price_scale(Math.abs(price_deviation)))
                        // .attr('r',3 + price_rate_scale(Math.abs(price_deviation_rate)))
                        .attr('fill',price_deviation>0?'#97b1a1':"#ca9e87")
                        .attr("opacity",0.7)
                    //update last price
                    last_price = current_price
                }
                current_interval += 1
            }

        },
        generate_interval_list(scaleX,trans){// to be finished
            let that = this

            let data = JSON.parse(JSON.stringify(trans)).reverse()
            let groups = [1]
            let time_interval = that.time_interval
            console.log(time_interval)
            let groupLen = 0
            Object.keys(time_interval).forEach((item,index)=>{
                let need_group = time_interval[item]['m']<that.time_threshold
                if(need_group){
                    if(index == Object.keys(time_interval).length-1){
                        groupLen += 1
                        groups.push(groupLen)
                    }else if(time_interval[(parseInt(item)+1)]['m']<that.time_threshold){
                        groupLen += 1
                    }else{
                        groupLen += 1
                        groups.push(groupLen)
                    }
                }else{
                    groups.push(1)
                    groupLen = 0
                }
            })
            groups = [...groups,1]
            console.log('groups',groups)
            
            //scale_rate
            let scale_rate = 1
            let aliquot_number = 0
            groups.forEach((item)=>{
                if(item==1){
                    aliquot_number+=1
                }else{
                    aliquot_number += scale_rate*item
                }
            })
            console.log('aliquot_number: ',aliquot_number)
            let interval_groups = []
            let interval_list = []
            let aliquot_width = (scaleX(trans.length)-scaleX(-1))/(aliquot_number)
            let current_loc = scaleX(-1)
            let current_id = 0
            let time_loc = 0
            let time_count = 0
            console.log(time_interval)
            groups.forEach((item,index)=>{
                let temp_loc = time_loc
                let temp_group_loc = current_loc
                if(item==1){
                    interval_list.push({
                        'id':current_id,
                        'loc':current_loc,
                        'width':aliquot_width,
                        'group_id':index,
                        'offset':0
                    })
                    if(current_id == 0 || current_id >= trans.length){
                        time_count = 0
                        time_loc += 0
                    }else{
                        time_count = time_interval[current_id]['m']
                        time_loc += time_interval[current_id]['m']                        
                    }
                    current_loc += aliquot_width
                    current_id += 1
                }else{
                    let offset = 0
                    while(offset<item){
                        // current_id += offset
                        interval_list.push({
                            'id':current_id,
                            'loc':temp_group_loc,
                            'width':aliquot_width*scale_rate,
                            'group_id':index,
                            'offset':offset                        
                        }) 
                        if(current_id == 0 || current_id == trans.length){
                            time_count = 0
                            time_loc += 0
                        }else{
                            time_count += time_interval[current_id]['m']
                            time_loc += time_interval[current_id]['m']                        
                        }
                        current_id += 1
                        current_loc += aliquot_width
                        offset += 1
                    }
                }
                //generate groups intervals
                interval_groups.push({
                        "group_id":index,
                        "group_loc":temp_group_loc,
                        "group_count":item,
                        "group_width":item*aliquot_width,
                        "group_time_loc":temp_loc,
                        "group_time_count":time_count
                    })
                time_count = 0
            })
            console.log(interval_groups, interval_list)
            this.interval_groups = interval_groups
            this.interval_list = interval_list
        },
        drawTimeDistortion(svg,scaleX,scaleY,trans,time_interval,interval_groups,time_threshold){
            let time_distortion_G = svg.append('g').classed("time_distortion",true)
            let total_minutes = d3.sum(Object.values(time_interval).map(item=>item['m']))
            console.log(total_minutes,interval_groups)
            let scale_time = d3.scaleLinear().domain([0,total_minutes]).range([scaleX(0),scaleX(trans.length-1)])
            interval_groups.forEach((group,index)=>{
                let group_color = "#eeeeee"
                if(index>0&&index<interval_groups.length-1){
                    if(group['group_count']>1){
                        group_color = '#e0e0e0'
                    }else{
                        if(group['group_time_count']<time_threshold){
                            group_color = '#e0e0e0'
                        }
                    }                    
                }

                let time_distortion_width = scale_time(group['group_time_count'])-scale_time(0)
                let time_distortion_y = scaleY(0)-30
                let time_distortion_x = scale_time(group['group_time_loc'])
                let time_distortion_height = 10
                time_distortion_G.append('rect').classed("time_distortion",true)
                    .attr("x",time_distortion_x)
                    .attr('y',time_distortion_y)
                    .attr("width",time_distortion_width)
                    .attr("height",time_distortion_height-2)
                    .attr('fill',group_color)
                    .attr('opacity',1)
                let time_distortion_d = `M${time_distortion_x} ${time_distortion_y+time_distortion_height} h${time_distortion_width} L${group['group_loc']+group['group_width']-1} ${scaleY(0)} h${-group['group_width']+2} z`
                time_distortion_G.append('path').classed("time_distortion",true)
                    .attr("d",time_distortion_d)
                    .attr('fill',group_color)
                    .attr('opacity',1)
            })
        },
        generateMatrixData(){
            console.log(this.connection_groups)
            let have_connections = Object.values(this.connection_groups).filter(item=>item['combine'].length>0)
            let total_connections = {
                'c_20':[],
                "c_721":[],
                "c_normal":[],
                "combine":[]
            }
            have_connections.forEach(item=>{
                total_connections['c_20'] = [...total_connections['c_20'],...item['c_20']]
                total_connections['c_721'] = [...total_connections['c_721'],...item['c_721']]
                total_connections['c_normal'] = [...total_connections['c_normal'],...item['c_normal']]
                total_connections['combine'] = [...total_connections['combine'],...item['combine']]
            })
            console.log(have_connections,total_connections)
            this.matrix_data = total_connections
        },
        drawMatrix(svg,start_X,scaleY,OwnerOrder,matrix_data,trans){
            //data part
            let combine = matrix_data['combine']
            let data2draw = {}
            combine.forEach(item=>{
                let from = OwnerOrder.indexOf(item['from']) 
                let to = OwnerOrder.indexOf(item['to']) 
                let is_exist = `${from}-${to}` in data2draw
                if(is_exist){
                    data2draw[`${from}-${to}`] = data2draw[`${from}-${to}`] + 1
                }else{
                    data2draw[`${from}-${to}`] = 1
                }
            })

            //data2draw2 nft trade
            let data2draw2 = {}
            //data2draw3 nft net income
            let data2draw3 = {}
            console.log(trans)
            trans.forEach(item=>{
                let to = OwnerOrder.indexOf(item['from_address']) 
                let from = OwnerOrder.indexOf(item['to_address']) 
                let is_exist = `${from}-${to}` in data2draw2
                if(is_exist){
                    data2draw2[`${from}-${to}`] = data2draw2[`${from}-${to}`] + 1
                }else{
                    data2draw2[`${from}-${to}`] = 1
                }
                if(item['status']=='Sale'){
                    if(to in data2draw3){
                        data2draw3[to] = data2draw3[to] - item['value']
                    }else{
                        data2draw3[to] = -item['value']
                    }                    
                    if(from in data2draw3){
                        data2draw3[from] = data2draw3[from] + item['value']
                    }else{
                        data2draw3[from] = item['value']
                    }                             
                }
            })


            console.log(data2draw,data2draw2,data2draw3)
            //draw part
            let matrix_G = svg.append("g").classed('matrix',true)            
            //draw matrix part
            let max_connections = Math.max(...Object.values(data2draw))
            let cel_color = d3.scaleLinear().domain([0,1,max_connections]).range(['white','#e8eaf6','#3f51b5'])
            let max_trade = Math.max(...Object.values(data2draw2))
            let stroke_color = d3.scaleLinear().domain([0,1,max_trade]).range(['white','#b49273','#5b3222'])
            let OwnerLen = OwnerOrder.length
            let cel_width = (scaleY(1)-scaleY(0))*0.8
            let m_scaleX = d3.scaleLinear().domain([0,OwnerLen+1]).range([start_X,start_X+this.oneNFT.height])
            let m_scaleY = d3.scaleLinear().domain([0,OwnerLen]).range([scaleY(0)-cel_width/2,scaleY(OwnerLen)-cel_width/2])
            for(let i=0;i<OwnerLen;i++){
                //row
                let row_index = i
                for(let j=0;j<OwnerLen;j++){
                    //column
                    let colomn_index = j
                    let value = 0
                    if(`${i}-${j}` in data2draw){
                        value = data2draw[`${i}-${j}`]
                    }
                    let stroke_value = 0
                    if(`${i}-${j}` in data2draw2){
                        stroke_value = data2draw2[`${i}-${j}`]
                    }
                    matrix_G.append('rect').classed('matrix',true)
                        .attr('x',m_scaleX(colomn_index))
                        .attr('y',m_scaleY(row_index))
                        .attr("width",cel_width)
                        .attr('height',cel_width)
                        .attr('fill',cel_color(value))
                        .attr('stroke',stroke_value>0?stroke_color(stroke_value):"grey")
                        .attr('stroke-width',stroke_value>0?3:0.1)
                }
            }
            //draw arc chart
            let arc_x = start_X+this.oneNFT.height + 70
            let scale_weight = d3.scaleLinear().domain([0,Math.max(max_trade,max_connections)]).range([1,5])
            let arc_generate = (loc,start,end,type,weight)=>{
                let y1 = scaleY(start), y2 = scaleY(end)
                let ry = Math.abs(y2-y1)/2
                let rx = ry
                let offset1 = 0
                let offset2 = 0

                if(type=='trade'){
                    if(start>=end){
                        loc += offset1
                    }else{
                        loc -= offset1
                    }
                    let d = `M ${loc} ${y1}`
                    d += `A ${rx*0.5} ${ry} ${0} ${0} ${0} ${loc} ${y2}`
                    return d                    
                }else if(type=='connection'){
                    if(start>=end){
                        loc += offset2
                    }else{
                        loc -= offset2
                    }
                    let d = `M ${loc} ${y1}`
                    d += `A ${rx} ${ry} ${0} ${0} ${0} ${loc} ${y2}`
                    return d     
                }
            }

            //draw connecton path
            Object.keys(data2draw).forEach(key=>{
                let start = parseInt(key.split('-')[0])
                let end = parseInt(key.split('-')[1])
                let weight = data2draw[key]
                matrix_G.append('path').classed('arc_path',true)
                    .attr("d",d=>{
                        return arc_generate(arc_x,start,end,"connection",weight)
                    })
                    .attr('stroke',"#6e9bc5")
                    .attr('stroke-width',scale_weight(weight))
                    .attr('fill','none')
                    .attr('opacity',1)
            })
            //draw trade path
            Object.keys(data2draw2).forEach(key=>{
                let start = parseInt(key.split('-')[0])
                let end = parseInt(key.split('-')[1])
                let weight = data2draw2[key]
                matrix_G.append('path').classed('arc_path',true)
                    .attr("d",d=>{
                        return arc_generate(arc_x,start,end,"trade",weight)
                    })
                    .attr('stroke',"#5f4321")
                    .attr('stroke-width',scale_weight(weight))
                    .attr('fill','none')
            })
            //draw circle
            let r = 2
            let interval_y = scaleY(1)-scaleY(0)
            let max_abs = Math.max(...Object.values(data2draw3).map(item=> Math.abs(item))) 
            console.log(max_abs)
            let r_scale = d3.scaleLinear().domain([0,max_abs]).range([r,interval_y*0.5])
            OwnerOrder.forEach((item,index)=>{
                if(index in data2draw3){
                    matrix_G.append('circle')
                        .attr('cx',arc_x)
                        .attr('cy',scaleY(index))
                        .attr('r',r_scale(Math.abs(data2draw3[index])))
                        .attr('fill',data2draw3[index]>0?'#97b1a1':"#ca9e87")
                        .attr('stroke',"white")
                        .attr("stroke-width",0.5)  
                        .attr('opacity',0.8)                  
                }

                matrix_G.append('circle')
                    .attr('cx',arc_x)
                    .attr('cy',scaleY(index))
                    .attr('r',r)
                    .attr('fill',"#5f4321")
                    .attr('stroke',"white")
                    .attr("stroke-width",0.5)
            })
        },
        drawNFTFlow(x,y,check_list,cut_time){
            d3.select('g.path_G').remove()
            d3.select('g.flow_G').remove()
            d3.select('g.arc_G').remove()
            d3.select('circle.bg').remove()
            d3.selectAll('defs').remove()
            //initialization
            let that = this
            //get the svg
            let svg = d3.select("svg.main")
                    .attr("width",that.svgWidth)
                    .attr("height",that.svgHeight)

            //configure
            // let transLen = new_trans.length
            let all_addresses = check_list['non-contract']
            // let addrLen = all_addresses.length

            // let new_order = []
            let zero_address = "0x0000000000000000000000000000000000000000"
            let zero_index = all_addresses.indexOf(zero_address)
            // let use_address = Object.keys(cut_time).filter(item=>cut_time[item]['trans'].filter(tran=>tran['from_addresses']!=zero_address).length>20)
            let filtered_trans = Object.keys(that.ConSta).filter(item=>that.ConSta[item]>that.trans_threshold)
            let use_address = new Set([])
            filtered_trans.forEach(item=>{
                use_address.add(item.split("+")[0])
                use_address.add(item.split("+")[1])
            })
            use_address = [...use_address]
            use_address = use_address.filter(address=>{
                if(cut_time[address]){
                    let temp = [...cut_time[address]['trans']]
                        .filter(item=>use_address.includes(item['to_address']) && use_address.includes(item['from_address']))
                        .filter(item=>that.timePaser(item['time_stamp']).getTime()>that.range[0]&&that.timePaser(item['time_stamp']).getTime()<that.range[1])
                    // cut_time[address]['trans'] = temp
                    return temp.length>0
                }else{
                    return false
                }
                })
            // let use_address = ['0xab61cc776cc19af7e99d3ba4539435311fa74e8a', '0xa081ae42802e0be86f5a6dd9274adf50c9986a1d', '0xc7437fd227b321ea62411be4341761dd68d0b6ad', '0x9dddf6e6e8cb33aba8eebb99ca69f62da321597a', '0x18a4489a739ac9835da14e006b35d65040e53a4a', '0xd44fea8b52e6078ab26249ea3cca8af01673172b', '0x91a3a407c4e8d07134641cffcf8a55e0059925c7', '0x07553dc55a3371c50e2269dbeddb976c62e85d8f', '0xd828d238d03d80cbe54aa1c56b047dc80ad284e1', '0x59acb0015b7c5ec9c1b955109c4ab34e4d4356a8', '0x577ebc5de943e35cdf9ecb5bbe1f7d7cb6c7c647', '0x4f13f0df25ac816d155dabc4390906d656f902bf', '0x37dc76ecdeaaee3755a7b8a9a54579769ddf4c35', '0x04e6f051e553125b3d14376d53a1c00078ce7342', '0x3090eef25c05c6cf6ff2988646ee27aa2f5c0178', '0xef3d9ddf59f3622a04753c61e6c4d596e7fc610d', '0x4003b5fee68a8659687a854135f61f2cb4f839b6', '0xec08d9464944345f1483f16a91c5186d8622637c', '0x1ace22a56af1ca4ca3edda6b22b1ef0007513684', '0xd3a265d9ed93464e7e2f89876f9ff0cb7b83ff27', '0xd7510a925475cb8377bc8d2a7f1c792022b68df8', '0x4ce73cc57943602df15fccf1ee291c5d67d38326', '0x9e199d8a3a39c9892b1c3ae348a382662dcbaa12', '0xfbcb950fd13add1fe0ba95440fba0851575c617d', '0xd327d751211921201277da07c556f18be8b4cf29', '0xb08856994dd338b0db1253dcab0e5f56e27f3985', '0x86cd4467b6baef4b0e34b9508d788483f64a4bb9', '0xb60211811a4977b5f4b65a1d2d27a2591d73d1ac', '0x8c0b5a9d8d0e4808c3d70340df3bae8f156fb043', '0xc52650d88793cf5fc0295bee9ae49284e67fecb1', '0xa99a76dddbb9678bc33f39919bc76d279c680c89', '0x2edadfb25586b1e4d6623c7021e76a2fa595cdec', '0xc1c9e5d91d212d1dff008443b6c00a0f002b1a9c', '0x5d4535bf9faf3a27b0352bbe1649a24982d57cb6', '0x440aae245b13201913da5da5dcd9b9d7cb3aab81', '0x0b81c1e1c53ee1eae26d6e504d28872d5d2728ef', '0x31a5ff62a1b2c0f030aee1661eab6513ae676e23', '0xaddb186047b8fd97d64c808f0b8df6589376f256', '0x1f055d883120bb393a8b0a913fbeb91667957201', '0x3eb12b7e49f1a95fbd2943d1547be152883e526f', '0xcaee6d433f36031b87d6e3c06395131a823314f3', '0xa9170f717f148e46ecfa34fdd5331aaf85e8b2fa', '0x783ca9833d58a6b39ee72db81f07571d72c0064e', '0x6b4331048c411795a89d54484e3653107d58a64e', '0xbb26a6da4d918682f58cc91bd3fb251dd28549d2', '0x90cfcdde22e8963560c09a52bc8c8a4dda1a6f39', '0x7be6e974dfc6e29515a91b704cf9a0fbc21d1624', '0x53cc044686be31eaea4286f0320c31e0e661613f', '0xd5b54ca74d254e9cd3a474492e362db1d746443b', '0xbab7bb9d9dcedbd587e849aa2ff0b18ef2099b6b', '0xe5f94006325cc051e448c3a02f88f7b7ac269d93', '0x19918ebaa17d8f04f98623d79f4ab89426c4a8f7', '0xc32575be004af0843d995d6139bbeb9f8085d970', '0x2684738cfc78f1291c43013e80f3bf6751684769', '0x64b926f1edc1c332cce280b2c8f43e879b1ca7cc', '0x8dbbca57ea56290efa14d835bbfd34faf1d89753', '0xca5e7f4cfef8220ff41a125efac21b5c6a404cc0', '0xa9552226ba53c5dfce2ff3cfae86d83dce529444', '0xe7be2f581decc12fbd1b2824bf541591cdaec7a3', '0x4d8e16a70f38414f33e8578913eef6a0e4a633b5', '0x94be13ae6223fcd742c1d749bb47baccb2b79b13', '0x98499134fd237e9a443a5b59e9ae9129f3c9f8b8', '0x13fefdd563a930f07b1ac8a2227acc27c3c12946', '0xadeed59f446cb0a141837e8f7c22710d759cba65', '0x960f16fff5070555c0efa22f6b839ed7d5ab6094', '0xc8ec8df6f8b76bf2e2835a7fbb5e617f8a182420', '0x4e13648de0aca3621434cd1d7c40b072b98f04fa', '0x030defb961d3f3480a574cedf6ead227a7a8106b', '0x4dcbb1fe5983ad5b44dc661273a4f11ca812f8b8', '0x2d75fb5482d92062cf5c52adf1d9a439dcd38b08', '0x0abd70eb980a55d9221e186b9b150539166fc679', '0x8b58dc8cec9c95f1750afa414318a1919547b2d6', '0x94de7e2c73529ebf3206aa3459e699fbcdfcd49b', '0xc67f86944736681996d5d2b0891ece8103da5db8', '0xcfd9ccafc35b86299fc5617f66e89c0782bacfe0', '0x6165fd87c1bc73a4c44b23934e9136fd92df5b01', '0xbbb76f409df39f490e55622e7be36cbc5c56d632', '0x910be4a2a2729894aa4550325b20928afb051a56', '0x6301add4fb128de9778b8651a2a9278b86761423', '0x0845fc89c51b2bcd1c3b0db9dbca497d641ec7d3', '0xf1bd1aba7d01a772814af74261a156da6e3210ec', '0x7e84e0c8d8b3c29cec79454b1291cf7375b231bf', '0x1beaa793c4df62246ed4af13eaf00b31dbb55a22', '0x95306e91f11fbd86ddcd7a1bc8eed6b06b338a05', '0xd7eae9fe9152317ee0542558836cb45fc5af2d39', '0x29b1b2d083456fd07b19649f8b85f9927a29b1ab', '0x2b84773955eee20e0ab23e44f0a174d92633fe84', '0xebfcb12abdae1db69d0772902a5c7504cb124287', '0x5c503df9051b1dbb941f3046cb293c97d7cef4ad', '0xe3dbc37f19c9496c81c6e19d656029a607193cf8', '0x55a0730a844727bd694fd8f938a456158be0f8a6', '0x5d18c78f374286d1fa6b1880545bfad714c29273', '0x7dbb760ecfdcbfe5d425c67019966ba05a3c48ae', '0xb6a684ce14addc0b0daad766424f3e28b49503a5', '0xefcdfb566c10c7a2366ed745be5d4cf11123aa3f', '0x02905c99b584d1ffaf71945943c38572553ac769', '0xec7641e298af02c19171451381c570327389b0c2', '0xd7fc4ab828afc1bb4b217f337f1777ca856efd12', '0x9c3d5f1330f0b872230e8ea312db9275910c8a82', '0x9cbc3b1435f84b3b30dd684bca287d1b1fb2a8a8', '0xd91dd13c3652d798ea6b93e543103e72eef9a6b9', '0x82ff9e428ad69f54f4c0251d13607af7da8bd91e', '0xa7106b4089e6f3f267d23abc02c9a862dcd7316e', '0x9674ede5eb609f9483dd1682f2160ec45105250d', '0x762ec7ca4658e76002447b0a29e1f44f575dbebc', '0xb921c84a49d4dd992fb39a2cba45b0dfe8d28275', '0x7b3892238e64fc1e5a744183e561e581ecd509da', '0x02cbb71121ef40db47e1419406f2f57538f29e94', '0xdf79b09da45ebb08ebc7834a9512e0bfa77056bb', '0x3295df41a2f288da03818ae32565e1599f1b2eee', '0x314787d7ac1efc6eb28fb3f1a5aba95e136bcb2b', '0x1407930f5ff83ff94532885557b334c74b3afc42', '0x85d105ca349bc896c580c711258b3a75de71f5cf', '0x536c73c5b43f878343baf6a4f339c3c381ea03ee', '0x82b1f29c5608238df2618f996827933c0d844079', '0xfc95c6e764575c96ca8cd03ee9d64c9e218655a3', '0x0601d0235645a6ce6356ef11aa0b225c68605131', '0x950012685408083b795506e13d87392bd55d6930', '0x8a527369df868cc46e7f781e6ae55bb278507e4e', '0xea333c8ebac2010bf70da013e5d56525f0c65581', '0xeef9a8b628e22ade70b509c45f6f1db1d43c0dd4', '0x8ad272ac86c6c88683d9a60eb8ed57e6c304bb0c', '0xc803698a4be31f0b9035b6eba17623698f3e2f82', '0x442dccee68425828c106a3662014b4f131e3bd9b', '0x721931508df2764fd4f70c53da646cb8aed16ace', '0xdb971068033f69b627323a2ca0ed46c4962f4ef2', '0xa236b5bbf42ea2b7f15dfd9704f67153201faa74', '0x64fbf8ea883d061d61130169ac9e54d410ae89f2', '0xc78ebf0eb5b008605eeabdb6a07584fe23ab75e6', '0x8b3383ffb325e3169c26b0d9cd6d0ae8c48f6331', '0xdb93342558502d4f522e774eac55d71bff8e6130', '0x19f23312627e560ea0199345782528686f1f3968', '0x6341ce65a3171bec75bf6eba33eeea4a9ba59737', '0x051858fc4fe71a2c8ff254237969881be369bc9e', '0xeae448e1537aa3c6b2a37e2ab26bba7ca2de9436', '0x567fdbe66195b7e6f4cab2290bbe2d83107a3ab3', '0x6ef2376fa6e12dabb3a3ed0fb44e4ff29847af68', '0xcb0d58cbb09fb8accefc2843f537c155203d58c4', '0xc272ed09c636edb6e858fa8702c182406185f1af', '0x5ee16428738078ffbd6ef9f436cb1a6ff1fc478b', '0xba0c68d6b353c2c36a657289e24ba36fe7172d2f', '0x2c81cee7050c9d03295560851ffde123bdf9696a', '0xaeb18a774d6be15af6df72577d80939ef0dab3ce', '0x26c01ab4efffcf017fe0392fbdf080dcb8252d80', '0x8c57e23cbf902ed01a7600fef1b8d083efb24909', '0xe75021660e00a7fa0df1b97da13ebabe6d82e7ea', '0x8bdc315628f74a81c9cf61ca5df2e368a7b2e20d', '0x1964f9cffa39ce77611b44dddd21a22290a5283c', '0xbb1ec73938b9df4baab4f5c43af96385a862811e', '0x57a1290bb834644cd65dfa7dc257054a502e2893', '0x3abe35eba716e436267384c637c65fc8585c50d6', '0x90d6f2b757c8ca57cd68743035186415789d34fd', '0x49446491e1f9830b0152de9e636d265ca5597ba5', '0x7ccd01e6256727d97d0dbcc80d0298f1178c0534', '0x6179e5e81c6833f2b55c7372d02d5d6dd2843cc4', '0x5ea9681c3ab9b5739810f8b91ae65ec47de62119', '0x3285ba409c0bd13a7e3f3fda5e721d8d5f8f80db', '0xf58e4d74db00a78878e708a4227d7bf030e6128c', '0x16033a8ebe3803056e40ccb3720f02440b2422b0', '0x7f3d2fcb1d78872135ea9585b354c49b63092110', '0xee402489d83e2b22d496910f8c810d35a3ad7b25', '0xf1ddb5dacc5a916842aae0a6fbe59c36f97bd940', '0xf36972bbff0bb63dbc8f2c8a93625647b32e024b', '0xd3018da893037f3046c715299ce513556784e849', '0x41ebaeb7025784a336020ce969710e252c1fc3ee', '0xb807152435c2cb5e45948da7481a0d6c59f820b6', '0xfd12d178ac2c1854129aaa2428164687f1d14eca', '0xd5509e06330ca2671f6f60da0ac6606c5e86c93e', '0xa8a51ad712215449d125cba1dc215910df1887fc', '0xa12c5c80d594e78f7bdef9842aa234b65339bd21', '0x4f95bfa0774ade72e55c975f569b9e9656870309', '0xa1ef639dd19214fbe4522d1df812a676a7ef2fb4', '0x07c5ea539a54318780655b7a74fc379f3f37c7a6', '0x61a4fc9028048e562b2a49d8dccf2378b644df03', '0x247ec63eba41edecfa96a46d732c5376f437b78e', '0x6197d54d4e8ceb5c6199063dd742b4d3fcb4f9d1', '0xa8d7d9548accb515ff98a5e38e2e5fbd00ef78f8', '0xf3860788d1597cecf938424baabe976fac87dc26', '0xea19b97a1523ba7796c3c9075b243e14d3995474', '0xbad4af9c8bc7eb07282c06e982eb4618e2586f3f', '0x90efa6074d9fee3d3df1b721df68cbb468cf2ab7', '0xecb793b01a1dadecb452fcca855b2f96822a9126', '0x2ee1e6483ab36c07a7f7593cee9c8c7df7c729ac', '0xe301612b0751f6d862a27be205fb8e3c40c8c6db', '0x76686847a10a6d88f3bc890b4f7ab3dfad2e57d5', '0x8ce0d9060263b1b5ad3eff2e1e21736b5ef36936', '0x479150abece65b0444d6ede5dca9c30d68e0e122', '0x7816ddad7a3290d3df8ff089c3d6365702d61595', '0xdd25a1e31e57c5098555e965ae727fcc5047acde', '0x4c5bf3cec6d8448cf682e0ba53bc0c8faff0c46f', '0xd315092b620ce48b437b03da903727a7a4b7fb10', '0x789655f162fe39c20c33957fe3a7c9c583e5d84f', '0x35d0ca92152d1fea18240d6c67c2adfe0cca287c', '0xa1e4f7dc1983fefe37e2175524ebad87f1c78c3c', '0x461a3dbe957486696ddf1147e9e0053da93571c2', '0xef768ef781637a7995a2b57ff77825e8abcf682d', '0xbd5ef06f8750f784930f7bd15484c4e7176e55c0', '0x32fedea027b7eb6d42c47479de3962ccca56900d', '0x4ae958b4de0e6f21d51e73625fb9d5e0c3b0985f', '0x9f0004e85ab1a65d569cbd9a59a46ef0c84cf470', '0xd7a9f29f765b1b199f2f0237d1d8690fd470f0aa', '0x9df947cd8a9810964473339c38a95201ecbe112d', '0x30391a4f9d2f099d41888f811784281cba4097f0', '0xd9ec6bef8eedcdb96c185fbb8f7fbedcb1aaf582', '0x1859bf856e2db2f4fa08b435b8c3b64fb50bb64a', '0xe18285b6ad1fe8cc73c5d2bc86ad2c1335d9f9b1', '0x2da526dd9d389f89bea8fd42c30e97d4ff7d04de', '0xe0fa4a19c108eecb019d131cf952c028c4e7a014', '0x38740516f691a66b4c1cd9156e9434c7915e73b3', '0xe83c750b2708320bb134796c555b80df39a3d97b', '0xfeae9fe11170fc19b6f40796fd1debfa360daacc', '0x50ea421b54fb7b034449808ba511a68ff4b0d29a', '0x48aabab1e5224540dfd31e48ded0ba6725185c93', '0x48039cfabedc5e0d24482a6f71edcf3a75b1921f', '0xb7cc2f9cadb0665debfd419cc0edb1569259dbb2', '0x84abb6c94713d77970b7dcc3143412585ba6c4d9', '0xa6e156193fe7fbc908007101cff94d83acfd469c', '0x4c969243fc60179b4aca73a361755aaa227f2241', '0x1447b49b636cb1fa24281efcd66aaac44188e3bc', '0xd7e630afcf128feb8b9071a8412914478c00c22a', '0xc02caad03884c2bb5821218a82a29cdd46ef683b', '0x5d8bff9300b6944cb2a2b88ae36fbaf8ee820afa', '0xf0893f3fe198742f9f6e46ae5de758f573509959', '0x5d89cc281c3f45433d93a33e1c64958b61bbef7b', '0x46e0dcceb5357f1c59a9de1b29173f85ddb8198f', '0x9f28152ae399a6f1b9760c04972de4f9303c0c9f']
            // let use_index = use_address.map(item => all_addresses.indexOf(item))
            // let use_len = use_address.length
            //random leaforder
            // that.LeafOrder = that.LeafOrder.sort(function(){return Math.random()-0.5})
            use_address.sort(function(a,b){
                let a_value = all_addresses.indexOf(a)>zero_index?that.LeafOrder.indexOf(all_addresses.indexOf(a)-1):that.LeafOrder.indexOf(all_addresses.indexOf(a))
                let b_value = all_addresses.indexOf(b)>zero_index?that.LeafOrder.indexOf(all_addresses.indexOf(b)-1):that.LeafOrder.indexOf(all_addresses.indexOf(b))
                return b_value-a_value
            })
            // console.log(zero_index)//"0x7e84e0c8d8b3c29cec79454b1291cf7375b231bf"
            // console.log(all_addresses.indexOf("0xc32575be004af0843d995d6139bbeb9f8085d970"))
            // console.log(all_addresses.indexOf("0x2edadfb25586b1e4d6623c7021e76a2fa595cdec"))
            // console.log(all_addresses.indexOf("0x7e84e0c8d8b3c29cec79454b1291cf7375b231bf"))
            // console.log(all_addresses.indexOf("0xa12c5c80d594e78f7bdef9842aa234b65339bd21"))
            // console.log(use_address)
            // let leaf = that.LeafOrder.filter(item=>use_index.indexOf(item)==-1)
            // let leaf_len = leaf.length

            // let insert_interval = parseInt(leaf_len/use_address.length)
            // console.log(leaf_len,insert_interval)
            // use_index.forEach((item,index)=>{
            //     let insert_index = index*insert_interval
            //     leaf.splice(insert_index,0,item)
            // })
            // console.log(zero_index)
            // all_addresses.forEach((item,index)=>{
            //     if(index == zero_index){
            //         new_order.push(addrLen-1)
            //     }else{
            //         let search_index = index
            //         if(index>zero_index){
            //             search_index = index-1
            //         }
            //         new_order.push(leaf.indexOf(search_index))
            //     }
            // })
            //circular based:
            let arc_G = svg.append('g').classed("arc_G",true)
            let R = that.svgHeight*0.3
            let CX = that.margin.left+1.08*R, CY = that.svgHeight*0.35
            that.circle_config = [CX,CY,R]

            let start_date = new Date()
            let end_date = new Date()
            start_date.setTime(that.range[0])
            end_date.setTime(that.range[1])
            console.log(start_date.getTime(),end_date.getTime())
            let r_scale = d3.scaleTime()
                .domain([start_date, end_date])
                .range([0.3*R,R])
            let angle_list = Object.keys(use_address).map(item=>item*Math.PI*2/(use_address.length))
            let c_scale = d3.scaleOrdinal()
                .domain(use_address)
                .range(angle_list)
            //defs
            let defs = svg.append('defs').classed('defs',true)   
            let brush_gradient = defs.append('linearGradient').attr('id','brush').attr('x1',0).attr('x2',0).attr('y1',0).attr('y2',1)
            brush_gradient.append('stop').attr("offset",'0%').attr("stop-color",that.color_scheme.brush_con).attr('stop-opacity',"0.4")
            brush_gradient.append('stop').attr("offset",'100%').attr("stop-color",that.color_scheme.brush_con).attr('stop-opacity',"0.1")
            
            //draw back ground
            let r_gradient_1 = defs.append("radialGradient").attr('id','price')
                    .attr('cx',0.5).attr('cy',0.5).attr('r',0.5).attr('fx',0.5).attr('fy',0.5)
                    .attr("spreadMethod",'pad')
            let r_gradient_2 = defs.append("radialGradient").attr('id','volume')
                    .attr('cx',0.5).attr('cy',0.5).attr('r',0.5).attr('fx',0.5).attr('fy',0.5)
                    .attr("spreadMethod",'pad')
            let bg_stop_1 = that.MPrice
            let bg_stop_2 = that.MTrans
            let max_price = Math.max(...Object.values(bg_stop_1))
            let min_price = Math.min(...Object.values(bg_stop_1))
            let bg_color_1 = d3.scaleLog()
                    .domain([min_price,max_price])
                    .range(that.color_scheme.bg_color)
            that.legends['price'] = ["Average Price:",`${min_price.toFixed(2)}`,`${max_price.toFixed(2)}`]
            let max_volume = Math.max(...Object.values(bg_stop_2))
            let min_volume = Math.min(...Object.values(bg_stop_2))
            let bg_color_2 = d3.scaleLog()
                    .domain([min_volume,max_volume])
                    .range(that.color_scheme.bg_color)
            that.legends['volume'] = ["Transaction Volume:",`${min_volume}`,`${max_volume}`]
            //bg
            let all_seconds = end_date.getTime() - start_date.getTime()
            let gradient_gen = (bg_stop,r_gradient,bg_color)=>{
                let stop_list = []
                Object.keys(bg_stop)
                    .forEach((t_str,index)=>{
                        let date_split = t_str.split('-')
                        let stop_date = new Date(date_split[0],date_split[1]-1,15,0)
                        let stop_second = stop_date.getTime() - start_date.getTime()
                        if(stop_date.getTime()>that.range[0]&&stop_date.getTime()<that.range[1]){
                            let stop_rate = parseInt((stop_second/all_seconds)*70+30) 
                            stop_list.push([stop_rate,bg_color(bg_stop[t_str]),bg_stop[t_str]])            
                        }
                    })
                stop_list = stop_list.sort((a,b)=>a[0]-b[0])
                stop_list.unshift([30,stop_list[0][1],stop_list[0][2]])
                stop_list.unshift([29,'white',0])
                console.log(stop_list)
                stop_list.forEach(item=>{
                        r_gradient.append('stop')    
                            .attr('offset',item[0]+'%')
                            .attr('stop-color',item[1]) 
                            .attr('stop-opacity',1)  
                })
                // r_gradient.append('stop')    
                //     .attr('offset','100%')
                //     // .attr('stop-color',"white") 
                //     .attr('stop-opacity',0.1)  
            }
            gradient_gen(bg_stop_1,r_gradient_1,bg_color_1)
            gradient_gen(bg_stop_2,r_gradient_2,bg_color_2)
            //bg circle
            arc_G.append('circle').classed('bg',true)
                .attr("cx",CX)
                .attr('cy',CY)
                .attr("r",R)
                .attr('fill',d=>that.bg_result==1?"url(#price)":'url(#volume)')
                .attr('opacity',1)
            //legend
            let legend = defs.append('linearGradient').attr('id','legend')
            let legend_key = that.bg_result==1?"price":"volume"
            let legend_data = that.legends[legend_key]
            legend.append('stop').attr('stop-color',that.color_scheme.bg_color[0]).attr('offset','0%')
            legend.append('stop').attr('stop-color',that.color_scheme.bg_color[1]).attr('offset','100%')
            let legend_G = arc_G.append('g').classed('legend_G',true)
            let legend_x = 0,legend_y= 16,h = 18
            let rect_x = that.bg_result==1?legend_x+170:legend_x+200
            legend_G.append('text').classed('legend',true)
                .attr('x',legend_x).attr('y',legend_y)
                .text(legend_data[0]).attr("fill","#606e79").attr('font-size',"15px").attr("font-weight",600)
            legend_G.append("rect").classed('legend',true)
                .attr('x',rect_x).attr('y',legend_y-14)
                .attr('width',150).attr('height',h)
                .attr("fill",`url(#legend)`)
            legend_G.append('text').classed('legend',true).attr('font-size',"15px").attr("font-weight",600)
                .attr('x',rect_x-5).attr('y',legend_y)
                .attr('text-anchor','end').attr("fill","#606e79")
                .text(`(${legend_data[1]})`)
            legend_G.append('text').classed('legend',true).attr('font-size',"15px").attr("font-weight",600)
                .attr('x',rect_x+155).attr('y',legend_y)
                .text(`(${legend_data[2]})`).attr("fill","#606e79")

            //line
            legend_G.append("rect").classed('legend_',true)
                .attr('x',legend_x+450).attr('y',legend_y-14)
                .attr('width',20).attr('height',h)
                .attr("fill",that.color_scheme.sale_line)
            legend_G.append('text').classed('legend_',true).attr('font-size',"15px").attr("font-weight",600)
                .attr('x',legend_x+h+457).attr('y',legend_y)
                .text("Sale").attr("fill","#606e79")
            legend_G.append("rect").classed('legend_',true)
                .attr('x',legend_x+520).attr('y',legend_y-14)
                .attr('width',20).attr('height',h)
                .attr("fill",that.color_scheme.trans_line)
            legend_G.append('text').classed('legend_',true).attr('font-size',"15px").attr("font-weight",600)
                .attr('x',legend_x+h+527).attr('y',legend_y)
                .text("Transfer").attr("fill","#606e79")
            let arc_d = (tran)=>{
                let start_angle = c_scale(tran['from_address']) 
                let end_angle = c_scale(tran['to_address'])
                let time_r = r_scale(that.timePaser(tran['time_stamp'])) 
                let start_x = CX + time_r*Math.cos(start_angle)
                let start_y = CY + time_r*Math.sin(start_angle)
                let end_x = CX + time_r*Math.cos(end_angle)
                let end_y = CY + time_r*Math.sin(end_angle)
                let sweep_flag
                if(Math.abs(start_angle-end_angle)>Math.PI){
                    sweep_flag = start_angle>end_angle?1:0
                }else{
                    sweep_flag = start_angle>end_angle?0:1
                }
                let Path = `M${start_x},${start_y} A${time_r} ${time_r} 0 0 ${sweep_flag} ${end_x},${end_y}`
                return Path
            }


            let trans_statistic = {}
            use_address.forEach(address=>{
                let nft_trans = [...cut_time[address]['trans']]
                    .filter(item=>use_address.includes(item['to_address']) && use_address.includes(item['from_address']))
                    .filter(item=>that.timePaser(item['time_stamp'])>that.range[0] && that.timePaser(item['time_stamp'])<that.range[1])
                // let nft_trans = cut_time[address]['trans']
                if(nft_trans.length>0){
                    [...nft_trans]
                        // .filter(item=>item['status']=='Sale')
                        .forEach(tran=>{
                            if(tran['from_address']!=tran['to_address']){
                                let key_1 = `${tran['from_address']}+${tran['to_address']}`
                                let key_2 = `${tran['to_address']}+${tran['from_address']}`
                                if(trans_statistic[key_1]){
                                    let set = [...new Set(trans_statistic[key_1][1]).add(tran['id'])] 
                                    let len = trans_statistic[key_1][0]+1
                                    trans_statistic[key_1] = [len,set]
                                }else if(trans_statistic[key_2]){
                                    let set = [...new Set(trans_statistic[key_2][1]).add(tran['id'])] 
                                    let len = trans_statistic[key_2][0]+1
                                    trans_statistic[key_2] = [len,set]
                                }else{
                                    trans_statistic[key_1] = [1,[tran['id']]]
                                }                            
                            }
                        })
                    // add a line:
                    arc_G.append('line')
                        .attr('x1',CX + r_scale(that.timePaser(nft_trans[0]['time_stamp']))*Math.cos(c_scale(address)))
                        .attr("x2",CX + r_scale(that.timePaser(nft_trans[nft_trans.length-1]['time_stamp']))*Math.cos(c_scale(address)))
                        .attr("y1",CY + r_scale(that.timePaser(nft_trans[0]['time_stamp']))*Math.sin(c_scale(address)))
                        .attr("y2",CY + r_scale(that.timePaser(nft_trans[nft_trans.length-1]['time_stamp']))*Math.sin(c_scale(address)))
                        .attr("stroke",that.color_scheme.address_line)
                        .attr("stroke-width",1.2)     
                        .attr("opacity",0.5)               
                }
            })
            console.log(trans_statistic)
            use_address.forEach(address=>{
                let nft_trans = [...cut_time[address]['trans']]
                    .filter(item=>use_address.includes(item['to_address']) && use_address.includes(item['from_address']))
                    .filter(item=>that.timePaser(item['time_stamp'])>that.range[0] && that.timePaser(item['time_stamp'])<that.range[1])
                if(nft_trans.length>0){
                    nft_trans.forEach(tran=>{
                            let status = tran['status']
                            arc_G.append("path")
                                .attr('d',d=>arc_d(tran))
                                .attr('stroke-width',1)
                                // .attr('stroke','#daeecc')
                                .attr('stroke',status=="Sale"?that.color_scheme.sale_line:that.color_scheme.trans_line)
                                .attr("opacity",1)
                                .attr("fill",'none')                        
                    })                 
                }
            })
            //draw inner connection
            let inner_G = arc_G.append('g').classed('inner_G',true)
            // let r_1 = R*0.1, r_2 = R*0.25,r_3 = 0.29*R
            let r_1 = 0, r_2 = R*0.3,r_3 = 0.3*R
            let inner_r_scale =(value,max)=>{
                let scale = d3.scaleLinear().domain([0,max]).range([r_1,r_2])
                return scale(value)
            } 
            let a_offset = Math.PI/use_address.length
            let inner_arc = (key)=>{
                let len = trans_statistic[key][1].length
                let tran_n = trans_statistic[key][0]/2
                if(len==tran_n){
                    return false
                }
                let address_1 = key.split('+')[0]
                let address_2 = key.split('+')[1]
                let angle_1 = c_scale(address_1)>c_scale(address_2)?c_scale(address_2):c_scale(address_1)
                let angle_2 = c_scale(address_1)>c_scale(address_2)?c_scale(address_1):c_scale(address_2)
                if(angle_2-angle_1>Math.PI){
                    let temp = angle_1
                    angle_1 = angle_2
                    angle_2 = temp+2*Math.PI
                }
                let r = r_3
                let x_1 = CX + r*Math.cos(angle_1)
                let y_1 = CY + r*Math.sin(angle_1)
                let x_2 = CX + r*Math.cos(angle_2)
                let y_2 = CY + r*Math.sin(angle_2)
                let inner_r = inner_r_scale(len/tran_n,1)
                let control_x_1 = CX + inner_r*Math.cos(angle_1)
                let control_x_2 = CX + inner_r*Math.cos(angle_2)
                let control_y_1 = CY + inner_r*Math.sin(angle_1)
                let control_y_2 = CY + inner_r*Math.sin(angle_2)
                let new_d = `M${x_1} ${y_1} S${control_x_1} ${control_y_1}, ${CX + inner_r*Math.cos(angle_1+a_offset)} ${CY + inner_r*Math.sin(angle_1+a_offset)}`
                new_d += `A${inner_r} ${inner_r} 0 0 1 ${CX + inner_r*Math.cos(angle_2-a_offset)},${CY + inner_r*Math.sin(angle_2-a_offset)} `
                new_d += `S${control_x_2} ${control_y_2}, ${x_2} ${y_2}`
                return new_d
            }
            inner_G.selectAll('circle.address')
                .data(use_address).join('circle').classed('address',true)
                .attr('cx',d=>CX+r_3*Math.cos(c_scale(d)))
                .attr('cy',d=>CY+r_3*Math.sin(c_scale(d)))
                .attr('r',r_3*a_offset*0.85>5?5:r_3*a_offset*0.85).attr('fill',that.color_scheme.inner_line)
                .attr('stroke','white').attr('stroke-width',1)
            Object.keys(trans_statistic).forEach(key=>{
                if(inner_arc(key)!=false){
                    inner_G.append('path')
                        .attr("d",inner_arc(key))
                        .attr('fill','none')
                        .attr('stroke',that.color_scheme.inner_line)
                        .attr('stroke-width',1) 
                        .attr("opacity",0.5)                   
                }
            })
            // inner_G.append('circle')
            //     .attr('cx',CX).attr('cy',CY)
            //     .attr('r',r_1).attr("fill",'none')
            //     .attr('stroke','grey').attr("stroke-width",0.5)
            //     .attr('stroke-dasharray','1,1')


            // timeline based
            // let x_scale = d3.scaleTime()
            //                 .domain([new Date(2021,4,1,0), new Date(2022,6,1,0)]).range([that.margin.left,that.svgWidth-that.margin.right])
            // // let y_scale = d3.scaleLinear().domain([0,addrLen]).range([y+that.margin.top,that.svgHeight*0.9])
            // let y_scale = d3.scaleLinear().domain([0,use_len]).range([y+that.margin.top,that.svgHeight*0.9])
            // let color_scale = d3.scaleLinear().domain([0,150]).range(['white','red'])
            // // let address_scale = d3.scaleOrdinal().domain(all_addresses).range(new_order)
            // let address_scale = d3.scaleOrdinal().domain(use_address).range(Object.keys(use_address))
            // // let address_scale = d3.scaleBand().domain(cut_time.keys()).range([0,cut_time.keys().length])

            // console.log(addrLen,all_addresses[1],address_scale(all_addresses[1]),y_scale(address_scale(all_addresses[1])))
            // //draw path:
            // // let path_list = []
            // // let offset = 1
            // // Object.keys(new_trans).forEach((token_id)=>{
            // //     if(new_trans[token_id].length<=2){}
            // //     else{
            // //     let data = new_trans[token_id]
            // //     let first_key = Object.keys(data)[0]
            // //     //real time
            // //     let path_d = `M${x_scale(that.timePaser(data[first_key]['time_stamp']))-offset},${y_scale(address_scale(data[first_key]['from_address']))} L${x_scale(that.timePaser(data[first_key]['time_stamp']))+offset},${y_scale(address_scale(data[first_key]['to_address']))}`
            // //     data.forEach((tran,index)=>{
            // //         if(index>0){
            // //             path_d += `H${x_scale(that.timePaser(tran['time_stamp']))-offset}`
            // //             path_d += `L${x_scale(that.timePaser(tran['time_stamp']))+offset},${y_scale(address_scale(tran['to_address']))}`
            // //         }
            // //     })
            // //     //trans order
            // //     // let new_offset = 25
            // //     // let path_d = `M${0},${y_scale(address_scale(data[0]['from_address']))} L${offset},${y_scale(address_scale(data[0]['to_address']))}`
            // //     // data.forEach((tran,index)=>{
            // //     //     if(index>1){
            // //     //         path_d += `H${new_offset}`
            // //     //         path_d += `L${(index+1)*new_offset*2+1},${y_scale(address_scale(tran['to_address']))}`
            // //     //     }
            // //     // })
            // //     // path_d += `H${x_scale(new Date(2022,6,1,0))-offset}`
            // //     path_list.push(path_d)
            // //     }
            // // })
            // // console.log(path_list.length)
            // // let path_G = svg.append('g').classed('path_G',true)
            // // path_G.selectAll('path.NFTpath')
            // //     .data(path_list)
            // //     .join('path').classed("NFTpath",true)
            // //         .attr('d',d=>d)
            // //         .attr('stroke-width',0.1)
            // //         .attr('stroke','black')
            // //         .attr("opacity",0.1)
            // //         .attr("fill",'none')

            // //draw nft area
            // let flow_G = svg.append('g').classed('flow_G',true)            
            // let nft_area = d3.area()
            // let area_scale = 1
            // let keys = Object.keys(cut_time)
            // // let use_address = ['0x91a3a407c4e8d07134641cffcf8a55e0059925c7', '0x8c0b5a9d8d0e4808c3d70340df3bae8f156fb043', '0x7e84e0c8d8b3c29cec79454b1291cf7375b231bf', '0xcb0d58cbb09fb8accefc2843f537c155203d58c4', '0x8bdc315628f74a81c9cf61ca5df2e368a7b2e20d', '0xa12c5c80d594e78f7bdef9842aa234b65339bd21']
            // // let use_address = ['0xab61cc776cc19af7e99d3ba4539435311fa74e8a', '0xa081ae42802e0be86f5a6dd9274adf50c9986a1d', '0xc7437fd227b321ea62411be4341761dd68d0b6ad', '0x9dddf6e6e8cb33aba8eebb99ca69f62da321597a', '0x18a4489a739ac9835da14e006b35d65040e53a4a', '0xd44fea8b52e6078ab26249ea3cca8af01673172b', '0x91a3a407c4e8d07134641cffcf8a55e0059925c7', '0x07553dc55a3371c50e2269dbeddb976c62e85d8f', '0xd828d238d03d80cbe54aa1c56b047dc80ad284e1', '0x59acb0015b7c5ec9c1b955109c4ab34e4d4356a8', '0x577ebc5de943e35cdf9ecb5bbe1f7d7cb6c7c647', '0x4f13f0df25ac816d155dabc4390906d656f902bf', '0x37dc76ecdeaaee3755a7b8a9a54579769ddf4c35', '0x04e6f051e553125b3d14376d53a1c00078ce7342', '0x3090eef25c05c6cf6ff2988646ee27aa2f5c0178', '0xef3d9ddf59f3622a04753c61e6c4d596e7fc610d', '0x4003b5fee68a8659687a854135f61f2cb4f839b6', '0xec08d9464944345f1483f16a91c5186d8622637c', '0x1ace22a56af1ca4ca3edda6b22b1ef0007513684', '0xd3a265d9ed93464e7e2f89876f9ff0cb7b83ff27', '0xd7510a925475cb8377bc8d2a7f1c792022b68df8', '0x4ce73cc57943602df15fccf1ee291c5d67d38326', '0x9e199d8a3a39c9892b1c3ae348a382662dcbaa12', '0xfbcb950fd13add1fe0ba95440fba0851575c617d', '0xd327d751211921201277da07c556f18be8b4cf29', '0xb08856994dd338b0db1253dcab0e5f56e27f3985', '0x86cd4467b6baef4b0e34b9508d788483f64a4bb9', '0xb60211811a4977b5f4b65a1d2d27a2591d73d1ac', '0x8c0b5a9d8d0e4808c3d70340df3bae8f156fb043', '0xc52650d88793cf5fc0295bee9ae49284e67fecb1', '0xa99a76dddbb9678bc33f39919bc76d279c680c89', '0x2edadfb25586b1e4d6623c7021e76a2fa595cdec', '0xc1c9e5d91d212d1dff008443b6c00a0f002b1a9c', '0x5d4535bf9faf3a27b0352bbe1649a24982d57cb6', '0x440aae245b13201913da5da5dcd9b9d7cb3aab81', '0x0b81c1e1c53ee1eae26d6e504d28872d5d2728ef', '0x31a5ff62a1b2c0f030aee1661eab6513ae676e23', '0xaddb186047b8fd97d64c808f0b8df6589376f256', '0x1f055d883120bb393a8b0a913fbeb91667957201', '0x3eb12b7e49f1a95fbd2943d1547be152883e526f', '0xcaee6d433f36031b87d6e3c06395131a823314f3', '0xa9170f717f148e46ecfa34fdd5331aaf85e8b2fa', '0x783ca9833d58a6b39ee72db81f07571d72c0064e', '0x6b4331048c411795a89d54484e3653107d58a64e', '0xbb26a6da4d918682f58cc91bd3fb251dd28549d2', '0x90cfcdde22e8963560c09a52bc8c8a4dda1a6f39', '0x7be6e974dfc6e29515a91b704cf9a0fbc21d1624', '0x53cc044686be31eaea4286f0320c31e0e661613f', '0xd5b54ca74d254e9cd3a474492e362db1d746443b', '0xbab7bb9d9dcedbd587e849aa2ff0b18ef2099b6b', '0xe5f94006325cc051e448c3a02f88f7b7ac269d93', '0x19918ebaa17d8f04f98623d79f4ab89426c4a8f7', '0xc32575be004af0843d995d6139bbeb9f8085d970', '0x2684738cfc78f1291c43013e80f3bf6751684769', '0x64b926f1edc1c332cce280b2c8f43e879b1ca7cc', '0x8dbbca57ea56290efa14d835bbfd34faf1d89753', '0xca5e7f4cfef8220ff41a125efac21b5c6a404cc0', '0xa9552226ba53c5dfce2ff3cfae86d83dce529444', '0xe7be2f581decc12fbd1b2824bf541591cdaec7a3', '0x4d8e16a70f38414f33e8578913eef6a0e4a633b5', '0x94be13ae6223fcd742c1d749bb47baccb2b79b13', '0x98499134fd237e9a443a5b59e9ae9129f3c9f8b8', '0x13fefdd563a930f07b1ac8a2227acc27c3c12946', '0xadeed59f446cb0a141837e8f7c22710d759cba65', '0x960f16fff5070555c0efa22f6b839ed7d5ab6094', '0xc8ec8df6f8b76bf2e2835a7fbb5e617f8a182420', '0x4e13648de0aca3621434cd1d7c40b072b98f04fa', '0x030defb961d3f3480a574cedf6ead227a7a8106b', '0x4dcbb1fe5983ad5b44dc661273a4f11ca812f8b8', '0x2d75fb5482d92062cf5c52adf1d9a439dcd38b08', '0x0abd70eb980a55d9221e186b9b150539166fc679', '0x8b58dc8cec9c95f1750afa414318a1919547b2d6', '0x94de7e2c73529ebf3206aa3459e699fbcdfcd49b', '0xc67f86944736681996d5d2b0891ece8103da5db8', '0xcfd9ccafc35b86299fc5617f66e89c0782bacfe0', '0x6165fd87c1bc73a4c44b23934e9136fd92df5b01', '0xbbb76f409df39f490e55622e7be36cbc5c56d632', '0x910be4a2a2729894aa4550325b20928afb051a56', '0x6301add4fb128de9778b8651a2a9278b86761423', '0x0845fc89c51b2bcd1c3b0db9dbca497d641ec7d3', '0xf1bd1aba7d01a772814af74261a156da6e3210ec', '0x7e84e0c8d8b3c29cec79454b1291cf7375b231bf', '0x1beaa793c4df62246ed4af13eaf00b31dbb55a22', '0x95306e91f11fbd86ddcd7a1bc8eed6b06b338a05', '0xd7eae9fe9152317ee0542558836cb45fc5af2d39', '0x29b1b2d083456fd07b19649f8b85f9927a29b1ab', '0x2b84773955eee20e0ab23e44f0a174d92633fe84', '0xebfcb12abdae1db69d0772902a5c7504cb124287', '0x5c503df9051b1dbb941f3046cb293c97d7cef4ad', '0xe3dbc37f19c9496c81c6e19d656029a607193cf8', '0x55a0730a844727bd694fd8f938a456158be0f8a6', '0x5d18c78f374286d1fa6b1880545bfad714c29273', '0x7dbb760ecfdcbfe5d425c67019966ba05a3c48ae', '0xb6a684ce14addc0b0daad766424f3e28b49503a5', '0xefcdfb566c10c7a2366ed745be5d4cf11123aa3f', '0x02905c99b584d1ffaf71945943c38572553ac769', '0xec7641e298af02c19171451381c570327389b0c2', '0xd7fc4ab828afc1bb4b217f337f1777ca856efd12', '0x9c3d5f1330f0b872230e8ea312db9275910c8a82', '0x9cbc3b1435f84b3b30dd684bca287d1b1fb2a8a8', '0xd91dd13c3652d798ea6b93e543103e72eef9a6b9', '0x82ff9e428ad69f54f4c0251d13607af7da8bd91e', '0xa7106b4089e6f3f267d23abc02c9a862dcd7316e', '0x9674ede5eb609f9483dd1682f2160ec45105250d', '0x762ec7ca4658e76002447b0a29e1f44f575dbebc', '0xb921c84a49d4dd992fb39a2cba45b0dfe8d28275', '0x7b3892238e64fc1e5a744183e561e581ecd509da', '0x02cbb71121ef40db47e1419406f2f57538f29e94', '0xdf79b09da45ebb08ebc7834a9512e0bfa77056bb', '0x3295df41a2f288da03818ae32565e1599f1b2eee', '0x314787d7ac1efc6eb28fb3f1a5aba95e136bcb2b', '0x1407930f5ff83ff94532885557b334c74b3afc42', '0x85d105ca349bc896c580c711258b3a75de71f5cf', '0x536c73c5b43f878343baf6a4f339c3c381ea03ee', '0x82b1f29c5608238df2618f996827933c0d844079', '0xfc95c6e764575c96ca8cd03ee9d64c9e218655a3', '0x0601d0235645a6ce6356ef11aa0b225c68605131', '0x950012685408083b795506e13d87392bd55d6930', '0x8a527369df868cc46e7f781e6ae55bb278507e4e', '0xea333c8ebac2010bf70da013e5d56525f0c65581', '0xeef9a8b628e22ade70b509c45f6f1db1d43c0dd4', '0x8ad272ac86c6c88683d9a60eb8ed57e6c304bb0c', '0xc803698a4be31f0b9035b6eba17623698f3e2f82', '0x442dccee68425828c106a3662014b4f131e3bd9b', '0x721931508df2764fd4f70c53da646cb8aed16ace', '0xdb971068033f69b627323a2ca0ed46c4962f4ef2', '0xa236b5bbf42ea2b7f15dfd9704f67153201faa74', '0x64fbf8ea883d061d61130169ac9e54d410ae89f2', '0xc78ebf0eb5b008605eeabdb6a07584fe23ab75e6', '0x8b3383ffb325e3169c26b0d9cd6d0ae8c48f6331', '0xdb93342558502d4f522e774eac55d71bff8e6130', '0x19f23312627e560ea0199345782528686f1f3968', '0x6341ce65a3171bec75bf6eba33eeea4a9ba59737', '0x051858fc4fe71a2c8ff254237969881be369bc9e', '0xeae448e1537aa3c6b2a37e2ab26bba7ca2de9436', '0x567fdbe66195b7e6f4cab2290bbe2d83107a3ab3', '0x6ef2376fa6e12dabb3a3ed0fb44e4ff29847af68', '0xcb0d58cbb09fb8accefc2843f537c155203d58c4', '0xc272ed09c636edb6e858fa8702c182406185f1af', '0x5ee16428738078ffbd6ef9f436cb1a6ff1fc478b', '0xba0c68d6b353c2c36a657289e24ba36fe7172d2f', '0x2c81cee7050c9d03295560851ffde123bdf9696a', '0xaeb18a774d6be15af6df72577d80939ef0dab3ce', '0x26c01ab4efffcf017fe0392fbdf080dcb8252d80', '0x8c57e23cbf902ed01a7600fef1b8d083efb24909', '0xe75021660e00a7fa0df1b97da13ebabe6d82e7ea', '0x8bdc315628f74a81c9cf61ca5df2e368a7b2e20d', '0x1964f9cffa39ce77611b44dddd21a22290a5283c', '0xbb1ec73938b9df4baab4f5c43af96385a862811e', '0x57a1290bb834644cd65dfa7dc257054a502e2893', '0x3abe35eba716e436267384c637c65fc8585c50d6', '0x90d6f2b757c8ca57cd68743035186415789d34fd', '0x49446491e1f9830b0152de9e636d265ca5597ba5', '0x7ccd01e6256727d97d0dbcc80d0298f1178c0534', '0x6179e5e81c6833f2b55c7372d02d5d6dd2843cc4', '0x5ea9681c3ab9b5739810f8b91ae65ec47de62119', '0x3285ba409c0bd13a7e3f3fda5e721d8d5f8f80db', '0xf58e4d74db00a78878e708a4227d7bf030e6128c', '0x16033a8ebe3803056e40ccb3720f02440b2422b0', '0x7f3d2fcb1d78872135ea9585b354c49b63092110', '0xee402489d83e2b22d496910f8c810d35a3ad7b25', '0xf1ddb5dacc5a916842aae0a6fbe59c36f97bd940', '0xf36972bbff0bb63dbc8f2c8a93625647b32e024b', '0xd3018da893037f3046c715299ce513556784e849', '0x41ebaeb7025784a336020ce969710e252c1fc3ee', '0xb807152435c2cb5e45948da7481a0d6c59f820b6', '0xfd12d178ac2c1854129aaa2428164687f1d14eca', '0xd5509e06330ca2671f6f60da0ac6606c5e86c93e', '0xa8a51ad712215449d125cba1dc215910df1887fc', '0xa12c5c80d594e78f7bdef9842aa234b65339bd21', '0x4f95bfa0774ade72e55c975f569b9e9656870309', '0xa1ef639dd19214fbe4522d1df812a676a7ef2fb4', '0x07c5ea539a54318780655b7a74fc379f3f37c7a6', '0x61a4fc9028048e562b2a49d8dccf2378b644df03', '0x247ec63eba41edecfa96a46d732c5376f437b78e', '0x6197d54d4e8ceb5c6199063dd742b4d3fcb4f9d1', '0xa8d7d9548accb515ff98a5e38e2e5fbd00ef78f8', '0xf3860788d1597cecf938424baabe976fac87dc26', '0xea19b97a1523ba7796c3c9075b243e14d3995474', '0xbad4af9c8bc7eb07282c06e982eb4618e2586f3f', '0x90efa6074d9fee3d3df1b721df68cbb468cf2ab7', '0xecb793b01a1dadecb452fcca855b2f96822a9126', '0x2ee1e6483ab36c07a7f7593cee9c8c7df7c729ac', '0xe301612b0751f6d862a27be205fb8e3c40c8c6db', '0x76686847a10a6d88f3bc890b4f7ab3dfad2e57d5', '0x8ce0d9060263b1b5ad3eff2e1e21736b5ef36936', '0x479150abece65b0444d6ede5dca9c30d68e0e122', '0x7816ddad7a3290d3df8ff089c3d6365702d61595', '0xdd25a1e31e57c5098555e965ae727fcc5047acde', '0x4c5bf3cec6d8448cf682e0ba53bc0c8faff0c46f', '0xd315092b620ce48b437b03da903727a7a4b7fb10', '0x789655f162fe39c20c33957fe3a7c9c583e5d84f', '0x35d0ca92152d1fea18240d6c67c2adfe0cca287c', '0xa1e4f7dc1983fefe37e2175524ebad87f1c78c3c', '0x461a3dbe957486696ddf1147e9e0053da93571c2', '0xef768ef781637a7995a2b57ff77825e8abcf682d', '0xbd5ef06f8750f784930f7bd15484c4e7176e55c0', '0x32fedea027b7eb6d42c47479de3962ccca56900d', '0x4ae958b4de0e6f21d51e73625fb9d5e0c3b0985f', '0x9f0004e85ab1a65d569cbd9a59a46ef0c84cf470', '0xd7a9f29f765b1b199f2f0237d1d8690fd470f0aa', '0x9df947cd8a9810964473339c38a95201ecbe112d', '0x30391a4f9d2f099d41888f811784281cba4097f0', '0xd9ec6bef8eedcdb96c185fbb8f7fbedcb1aaf582', '0x1859bf856e2db2f4fa08b435b8c3b64fb50bb64a', '0xe18285b6ad1fe8cc73c5d2bc86ad2c1335d9f9b1', '0x2da526dd9d389f89bea8fd42c30e97d4ff7d04de', '0xe0fa4a19c108eecb019d131cf952c028c4e7a014', '0x38740516f691a66b4c1cd9156e9434c7915e73b3', '0xe83c750b2708320bb134796c555b80df39a3d97b', '0xfeae9fe11170fc19b6f40796fd1debfa360daacc', '0x50ea421b54fb7b034449808ba511a68ff4b0d29a', '0x48aabab1e5224540dfd31e48ded0ba6725185c93', '0x48039cfabedc5e0d24482a6f71edcf3a75b1921f', '0xb7cc2f9cadb0665debfd419cc0edb1569259dbb2', '0x84abb6c94713d77970b7dcc3143412585ba6c4d9', '0xa6e156193fe7fbc908007101cff94d83acfd469c', '0x4c969243fc60179b4aca73a361755aaa227f2241', '0x1447b49b636cb1fa24281efcd66aaac44188e3bc', '0xd7e630afcf128feb8b9071a8412914478c00c22a', '0xc02caad03884c2bb5821218a82a29cdd46ef683b', '0x5d8bff9300b6944cb2a2b88ae36fbaf8ee820afa', '0xf0893f3fe198742f9f6e46ae5de758f573509959', '0x5d89cc281c3f45433d93a33e1c64958b61bbef7b', '0x46e0dcceb5357f1c59a9de1b29173f85ddb8198f', '0x9f28152ae399a6f1b9760c04972de4f9303c0c9f']

            
            
            // // let use_address = keys
            // use_address.forEach((address,index)=>{
            //     let y_focus = y_scale(address_scale(address))
            //     nft_area.x(d=> x_scale(that.timePaser(d['end_time'])))
            //         .y1(d=>d['NFT'].length<20?y_focus+d['NFT'].length*area_scale:y_focus)
            //         .y0(d=>d['NFT'].length<20?y_focus-d['NFT'].length*area_scale:y_focus)
            //         .curve(d3.curveBumpX)
            //     // flow_G.append('path').classed('NFTflow',true)
            //     //     .attr('d',nft_area(cut_time[address]['cut_list']))
            //     //     .attr("opacity",0.2)
            //     //     .attr("fill",'red')
            //     let nft_trans = cut_time[address]['trans'].filter(item=>use_address.includes(item['to_address']) && use_address.includes(item['from_address']))
            //     if(nft_trans.length>0){
            //         flow_G.append('g').classed(`${address}`,true)
            //         .selectAll("path.trans")
            //             .data(nft_trans)
            //             .join('path').classed('trans',true)
            //             .attr('d',d=>{
            //                 return `M${x_scale(that.timePaser(d['time_stamp']))},${y_scale(address_scale(d['from_address']))} V${y_scale(address_scale(d['to_address']))}`
            //             })
            //             .attr('stroke-width',1)
            //             .attr('stroke',d=>{
            //                 if(use_address.includes(d['to_address']) && use_address.includes(d['from_address'])){
            //                     return '#6e9bc5'
            //                 }else{
            //                     return "#779649"//"#779649"
            //                 }
            //             })
            //             .attr("opacity",0.2)
            //             .attr("fill",'none')
            //         //draw a line
            //         flow_G.append('line')
            //             .attr('x1',x_scale(that.timePaser(nft_trans[0]['time_stamp'])))
            //             .attr("x2",x_scale(that.timePaser(nft_trans[nft_trans.length-1]['time_stamp'])))
            //             .attr("y1",y_focus)
            //             .attr("y2",y_focus)
            //             .attr("stroke",'blue')
            //             .attr("stroke-width",0.2)
            //     }
            // })


            //draw detail views:
            // let test_address = ['0x91a3a407c4e8d07134641cffcf8a55e0059925c7', '0x8c0b5a9d8d0e4808c3d70340df3bae8f156fb043', '0x7e84e0c8d8b3c29cec79454b1291cf7375b231bf', '0xcb0d58cbb09fb8accefc2843f537c155203d58c4', '0x8bdc315628f74a81c9cf61ca5df2e368a7b2e20d', '0xa12c5c80d594e78f7bdef9842aa234b65339bd21']
            let test_address = []
            let detail_x = CX + 1.11*R
            let detail_y1 = CY-R*0.55
            let detail_y2 = CY+R*0.9
            that.detail_loc = [detail_x,detail_y1,detail_y2]
            that.drawDetail(detail_x,detail_y1,detail_y2,svg,test_address,start_date,end_date)

            // draw a circular brush
            this.addCircularBrush(svg,arc_G,CX,CY,R,r_scale,c_scale,use_address)

        },
        drawDetail(x,y1,y2,svg,address_list,time_1,time_2){
            d3.select('g.detail_G').remove()
            let that = this
            let detail_G = svg.append("g").classed('detail_G',true)
            //data process
            let all_addresses = that.CheckList['non-contract']
            let zero_address = "0x0000000000000000000000000000000000000000"
            let zero_index = all_addresses.indexOf(zero_address)
            console.log(that.CutTime)
            address_list = address_list.filter(item=>{
                console.log(item)
                return that.CutTime[item]['trans'].filter(tran=>{
                    let tran_time = that.timePaser(tran['time_stamp'])
                    if(tran_time>=time_1&&tran_time<=time_2){return true}
                    else{return false}
                }).length>0
            })
            if(address_list.length==0){
                d3.selectAll('.group').remove()
                return false
            }
            address_list.sort(function(a,b){
                let a_value = all_addresses.indexOf(a)>zero_index?that.LeafOrder.indexOf(all_addresses.indexOf(a)-1):that.LeafOrder.indexOf(all_addresses.indexOf(a))
                let b_value = all_addresses.indexOf(b)>zero_index?that.LeafOrder.indexOf(all_addresses.indexOf(b)-1):that.LeafOrder.indexOf(all_addresses.indexOf(b))
                return b_value-a_value
            })
            //START
            let each_width = {}
            let stack_nft = 0
            let stack_trans = []
            let unique_trans = []
            address_list.forEach(address=>{
                let max_nft = 0
                that.CutTime[address]['cut_list'].filter(item=>{
                    let end_time = that.timePaser(item['end_time']) 
                    return end_time>=time_1 && end_time<=time_2
                })
                .forEach(cut=>{
                    max_nft = cut['NFT'].length>max_nft?cut['NFT'].length:max_nft
                })
                each_width[address] = [max_nft,stack_nft+max_nft/2]
                stack_nft += max_nft
                //trans
                that.CutTime[address]['trans'].forEach(item=>{
                    let this_index = `${item['id']}+${item['time_stamp']}+${item['from_address']}`
                    if(unique_trans.indexOf(this_index)>-1){
                    }else{
                        unique_trans.push(this_index)
                        stack_trans.push(item)
                    }
                })
            })
            //trans
            stack_trans.sort((a,b)=>{
                return that.timePaser(a['time_stamp'])-that.timePaser(b['time_stamp'])
            })
            let trans_str =(id,time_str,from)=>{
                return `${id}+${time_str}+${from}`
            }
            let tran_str_list = stack_trans.map(item=>`${item['id']}+${item['time_stamp']}+${item['from_address']}`)
            let str_to_tran_index = d3.scaleOrdinal().domain(tran_str_list).range(Object.keys(tran_str_list).map(item=>parseInt(item)))

            //redraw the detail path     
            let temp_str_list= [...tran_str_list].filter(item=>{
                let this_time = that.timePaser(item.split('+')[1])
                return this_time>=time_1&&this_time<=time_2
            })
            let o_start_i = str_to_tran_index(temp_str_list[0])
            let o_end_i = str_to_tran_index(temp_str_list[temp_str_list.length-1])

            //get new data flow
            let addr_scale = d3.scaleOrdinal().domain(address_list).range(Object.keys(address_list).map(item=>parseInt(item)))
            let new_data = {}//new data flow
            let nft_set = new Set([])
            address_list.forEach(address=>{
                let each_set = new Set([])
                let nft_flow = {}
                let current = []
                that.CutTime[address]['trans'].sort((a,b)=>that.timePaser(a['time_stamp'])-that.timePaser(b['time_stamp']))
                .forEach(tran=>{
                    nft_set.add(tran['id'])
                    each_set.add(tran['id'])
                    if(tran['to_address']==address&&tran['from_address']==address){}
                    else if(tran['to_address']==address){
                        if(tran['from_address']==zero_address){
                            current.unshift(tran['id'])
                        }else if(address_list.indexOf(tran['from_address'])==-1){
                            current.push(tran['id'])
                        }else if(addr_scale(tran['from_address'])>addr_scale(address)){
                            current.push(tran['id'])
                        }else{
                            current.unshift(tran['id'])
                        }
                    }else if(tran['from_address']==address){//from == address
                        let delete_index = current.indexOf(tran['id'])
                        if(delete_index==-1){
                        }else{
                            current.splice(delete_index,1)
                        }
                        // console.log(current)
                    }
                    nft_flow[trans_str(tran['id'],tran['time_stamp'],tran['from_address'])] = [...current]
                })
                new_data[address] = [[...each_set],nft_flow]
            })
            //add a middle overview nft flow
            let nft_stack_list = []
            address_list.forEach((address,index)=>{
                let nft_flow = new_data[address][1]
                let key_list = Object.keys(nft_flow).sort((a,b)=>{
                        return str_to_tran_index(a)-str_to_tran_index(b)
                    })
                let new_flow = Object.keys(nft_flow)
                    .filter(tran_str=>{
                        let this_id = str_to_tran_index(tran_str)
                        return this_id>=o_start_i && this_id<=o_end_i
                        })
                    .sort((a,b)=>{
                        return that.timePaser(a.split('+')[1])-that.timePaser(b.split('+')[1])
                    })
                let last_str = key_list[key_list.indexOf(new_flow[0])-1] 
                let last_count = nft_flow[last_str]?nft_flow[last_str].length:0
                for(let i=o_start_i;i<=o_end_i;i++){                
                    if(index==0){
                        nft_stack_list.push({
                            'index':i,
                        })
                    }
                    if(nft_flow[tran_str_list[i]]){ 
                        let len = nft_flow[tran_str_list[i]].length              
                        nft_stack_list[i-(o_start_i)][address]=len
                        last_count = len
                    }else{
                        nft_stack_list[i-(o_start_i)][address]=last_count
                    }
                }
            })
            console.log(nft_stack_list)
            let stack = d3.stack()
                .keys(address_list)
                .order(d3.stackOrderReverse)
                // .offset(d3.stackOffsetSilhouette)
                .offset(d3.stackOffsetNone)
            console.log(stack(nft_stack_list))
            let max_stack = Math.max(...(stack(nft_stack_list)[0].map(item=>item[1]))) 
            let min_stack = Math.min(...(stack(nft_stack_list)[stack(nft_stack_list).length-1].map(item=>item[0]))) 
            console.log(min_stack,max_stack)
            let o_x_scale = d3.scaleLinear().domain([o_start_i,o_end_i]).range([x,that.svgWidth-that.margin.right])
            let l_y = 2,l_x = x+155,l_width = 20
            let o_y1 = l_y+l_width+50 ,o_y2 = y1-50
            let o_y_scale = d3.scaleLinear().domain([min_stack,max_stack]).range([o_y2,o_y1])
            let o_color = d3.scaleOrdinal().domain(address_list).range(that.color_scheme.flow_line)
            let o_legend_G = detail_G.append("g").classed('o_legend_G',true)
            o_legend_G.append('text').attr("x",x).attr('y',l_y+14).text("Selected Addresses:")
                .attr("fill","#606e79").attr("font-weight",600).attr('font-size',"15px")
            address_list.forEach((address,index)=>{
                let this_G = o_legend_G.append('g').classed(`legend_${index+1}`,true)
                this_G.append('rect')
                    .attr("x",l_x+index*l_width*1.1)
                    .attr('y',l_y)
                    .attr('width',l_width).attr('height',l_width)
                    .attr('fill',o_color(address))
                    .attr("opacity",1)
                this_G.append('text')
                    .attr("x",l_x + (index*1.1 + 0.5) * l_width)
                    .attr('y',l_y+0.75*l_width)
                    .attr('fill',that.color_scheme.o_text )
                    .attr("text-anchor","middle").attr("font-size","15px").attr("font-weight",600)
                    .text(`${index+1}`)
                this_G.on("mouseover",function(_event){
                    that.hover_addr(_event,address)
                }).on("mouseout",function(_event){
                    that.out_addr()
                })
            })
            o_legend_G.append("text")
                .attr("x",l_x-156).attr('text-anchor','end')
                .attr('y',o_y1+10).attr("fill","grey").attr('font-weight',600).attr('font-size',"14px")
                .text(`${parseInt(max_stack-min_stack)}`)
            o_legend_G.append("text")
                .attr("x",l_x-156).attr('text-anchor','end')
                .attr('y',o_y2-2).attr("fill","grey").attr('font-weight',600).attr('font-size',"14px")
                .text(`0`)
            // o_legend_G.append("path")
            //     .attr('d',`M${o_x_scale(o_start_i)} ${o_y1} h-15 V${o_y2} h15`)
            //     .attr('fill','none')
            //     .attr('stroke',"grey").attr('stroke-width',2)

            
            let flow_area = d3.area()
                .x((d,i)=>o_x_scale(i+o_start_i))
                .y0(d=>o_y_scale(d[0]))
                .y1(d=>o_y_scale(d[1]))
                // .curve(d3.curveBasisOpen)
                .curve(d3.curveBumpX)
            let o_flow_G = detail_G.append('g').classed('o_flow_G',true)
            o_flow_G.selectAll('path.flow_area')
                .data(stack(nft_stack_list))
                .join('path').classed('flow_area',true)
                    .attr('d',flow_area)
                    .attr('fill',(d,i)=>o_color(address_list[i]))
                    .attr('stroke','white')
                    .attr('stroke-width',0.3)
                    .attr("opacity",0.7)
            //boarder
            o_flow_G.append("rect").classed('group',true)
                .attr('x',x).attr('y',o_y1).attr('height',o_y2-o_y1).attr('width',1).attr('fill',that.color_scheme.brush_connection[0])
            o_flow_G.append("rect").classed('group',true)
                .attr('x',that.svgWidth-that.margin.right).attr('y',o_y1).attr('height',o_y2-o_y1).attr('width',1).attr('fill',that.color_scheme.brush_connection[0])
            //brush
            o_flow_G.append('rect').classed('brush_area',true)
                .attr('x',o_x_scale(o_start_i))
                .attr('y',o_y1)
                .attr('width',o_x_scale(o_end_i)-o_x_scale(o_start_i))
                .attr('height',o_y2-o_y1)
                .attr('fill','white')
                .attr('opacity',0)
            console.log(tran_str_list[o_start_i])
            let start_time = tran_str_list[o_start_i].split('+')[1].split('T')
            let end_time = tran_str_list[o_end_i].split('+')[1].split('T')
            o_flow_G.append('text').attr('x',o_x_scale(o_start_i)).attr('y',o_y2+12)
                .attr("fill","grey").attr('font-weight',600).attr('font-size',"14px")
                .text(`${start_time[0]} ${start_time[1].slice(0,8)}`)
            o_flow_G.append('text').attr('x',o_x_scale(o_end_i)).attr('y',o_y2+12)
                .attr("fill","grey").attr('font-weight',600).attr('font-size',"14px").attr('text-anchor',"end")
                .text(`${end_time[0]} ${end_time[1].slice(0,8)}`)
            let brushed = (_event)=>{
                d3.selectAll('path.brush_').remove()
                d3.selectAll('text.brush_').remove()
                let start_i = Math.floor(o_x_scale.invert(_event.selection[0])) 
                let end_i = Math.ceil(o_x_scale.invert(_event.selection[1])) 
                let b_offset = 1
                let left_d = `M${_event.selection[0]} ${o_y2+b_offset} S${(_event.selection[0]+o_x_scale(o_start_i))*0.5} ${y1+b_offset}, ${o_x_scale(o_start_i)+10} ${y1+b_offset} `
                let right_d = `M${_event.selection[1]-2} ${o_y2+b_offset} S${(_event.selection[1]+o_x_scale(o_end_i))*0.5} ${y1+b_offset},${o_x_scale(o_end_i)} ${y1+b_offset}`
                let brush_d = `M${_event.selection[0]} ${o_y2+b_offset} H${_event.selection[1]} S${(_event.selection[1]+o_x_scale(o_end_i))*0.5} ${y1+b_offset},${o_x_scale(o_end_i)} ${y1+b_offset} H${o_x_scale(o_start_i)} S${(_event.selection[0]+o_x_scale(o_start_i))*0.5} ${y1+b_offset},${_event.selection[0]} ${o_y2+b_offset} Z`
                o_flow_G.append('path').classed('brush_',true)
                        .attr('d',brush_d)
                        .attr('fill','url(#brush)')
                o_flow_G.append('path').classed('brush_',true)
                        .attr('d',left_d).attr('stroke',that.color_scheme.brush_boarder).attr("stroke-width",2)
                        .attr('fill','none')
                o_flow_G.append('path').classed('brush_',true)
                        .attr('d',right_d).attr('stroke',that.color_scheme.brush_boarder).attr("stroke-width",2)
                        .attr('fill','none')
                let _start_time = tran_str_list[start_i].split('+')[1].split('T')
                let _end_time = tran_str_list[end_i].split('+')[1].split('T')
                o_flow_G.append('text').attr('x',o_x_scale(start_i)).attr('y',o_y1-2).classed('brush_',true)
                    .attr("fill","grey").attr('text-anchor',"end").attr('font-weight',600).attr('font-size',"14px")
                    .text(`${_start_time[0]} ${_start_time[1].slice(0,8)}`)
                o_flow_G.append('text').attr('x',o_x_scale(end_i)).attr('y',o_y1-2).classed('brush_',true)
                    .attr("fill","grey").attr('font-weight',600).attr('font-size',"14px")
                    .text(`${_end_time[0]} ${_end_time[1].slice(0,8)}`)
                //time 
                //into the detail
                that.reDrawGroup(x,y1,y2,detail_G,start_i,end_i,address_list,new_data,stack_nft,stack_trans,each_width,trans_str,tran_str_list,str_to_tran_index)
            
            }            
            let default_start =o_start_i + parseInt((o_end_i-o_start_i)*0.2)
            let default_end = default_start + parseInt((o_end_i-o_start_i)*0.8)
            if(o_end_i-o_start_i>80){
                default_end = default_start+50
            }
            let o_brush = d3.brushX()
                    .extent([[o_x_scale(o_start_i),o_y1],[o_x_scale(o_end_i),o_y2]])
                    .on("start brush end",brushed)
            o_flow_G.call(o_brush)
                .call(o_brush.move,[o_x_scale(default_start),o_x_scale(default_end)])
                
            // that.reDrawGroup(x,y1,y2,detail_G,default_start,default_end,address_list,new_data,stack_nft,stack_trans,each_width,trans_str,tran_str_list,str_to_tran_index)
},
reDrawGroup(x,y1,y2,detail_G,start_i,end_i,address_list,new_data,stack_nft,stack_trans,each_width,trans_str,tran_str_list,str_to_tran_index){
            d3.select('g.d_d_G').remove()
            d3.select('g.locate').remove()
            d3.selectAll('line.boarder').remove()
            let that = this
            x = x+10
            //filtering
            let old_address_list = [...address_list]
            let trans_color = (addr)=>{
                let scale = d3.scaleOrdinal().domain(old_address_list).range(that.color_scheme.flow_line)
                if(old_address_list.indexOf(addr)>-1){
                    return scale(addr)
                }else{
                    return that.color_scheme.boarder_line
                }
            } 
            let flow_color = d3.scaleOrdinal().domain(old_address_list).range(that.color_scheme.flow_line)
            //process
            let new_address_list = [...address_list].filter(address=>{
                return Object.keys(new_data[address][1]).filter(tran_str=>{
                    let this_id = str_to_tran_index(tran_str)
                    return this_id>=start_i && this_id<=end_i
                    }).length>0
            })
            let new_each_width = {}
            let new_new_data = {}
            let exist_stack = 0
            new_address_list.forEach(address=>{
                let new_len = Math.max(...Object.keys(new_data[address][1])
                    .filter(tran_str=>{
                        let this_id = str_to_tran_index(tran_str)
                        return this_id>=start_i && this_id<=end_i
                    })
                    .map(item=>new_data[address][1][item].length)) 
                //each width
                new_each_width[address] = [new_len,exist_stack+new_len*0.5]
                exist_stack += new_len
                //newnew data
                new_new_data[address] = [new_data[address][0],new_data[address][1]]
            })                
            each_width = new_each_width
            stack_nft = exist_stack
            address_list = new_address_list
            new_data = new_new_data
            


            let detail_d_G = detail_G.append('g').classed('d_d_G',true)
            let x_scale = d3.scaleLinear().domain([start_i,end_i]).range([x,that.svgWidth-that.margin.right])
            let max_path_width = (y2-y1)/(stack_nft*2)
            let path_width = x_scale(0.4)-x_scale(0)>max_path_width?max_path_width:x_scale(0.4)-x_scale(0)
            if(that.path_width/path_width>0.9&&that.path_width/path_width<1.1){
                path_width = that.path_width
            }else{
                that.path_width = path_width
            }
            let gap_width = 1.05*path_width
            let y_central = 0.5*(y1+y2)
            let y_offset = 1.3*gap_width*stack_nft<0.46*(y2-y1)?0.46*(y2-y1):1.3*gap_width*stack_nft
            let boarder_y = 10
            let min_y = y_central-y_offset<y1+boarder_y?y1+boarder_y:y_central-y_offset
            let max_y = y_central+y_offset>y2-boarder_y?y2-boarder_y:y_central+y_offset
            let y_scale = d3.scaleLinear().domain([0,stack_nft]).range([min_y,max_y])

            // //draw locate circle
            // let boarder_offset = 20
            //left right
            detail_G.append("rect").classed('boarder',true)
                .attr('x',x).attr('y',y1).attr('height',y2-y1).attr('width',2).attr('fill',that.color_scheme.brush_boarder)          
            detail_G.append("rect").classed('boarder',true)
                .attr('x',that.svgWidth-that.margin.right).attr('y',y1).attr('height',y2-y1).attr('width',2).attr('fill',that.color_scheme.brush_boarder)
            //bottom top
            // detail_G.append("rect").classed('boarder',true)
            //     .attr('x',x).attr('y',y2+boarder_offset).attr('height',2).attr('width',that.svgWidth-that.margin.right-x).attr('fill',that.color_scheme.brush_boarder)
            // detail_G.append("rect").classed('boarder',true)
            //     .attr('x',x).attr('y',y2+boarder_offset).attr('height',2).attr('width',that.svgWidth-that.margin.right-x).attr('fill',that.color_scheme.brush_boarder)

            
            detail_G.append('g').classed('locate',true)
                .selectAll('text.locate').data(address_list)
                .join('text').classed('locate',true).attr("text-anchor",'end')
                .attr("x",x-5).attr("y",d=>y_scale(each_width[d][1])+5)
                .attr("fill",d=>that.color_scheme.flow_line[old_address_list.indexOf(d)]).attr('font-weight',600).attr('font-size',"14px")
                .text(d=>old_address_list.indexOf(d)+1)
            detail_G.append("text").classed("locate",true)
                .attr("x",x+5).attr("y",d=>y2-5)
                .attr("fill","#adb5bd").attr('font-weight',600).attr('font-size',"14px")
                .text("Others")
            detail_G.append("text").classed("locate",true)
                .attr("x",x+5).attr("y",d=>y1+15)
                .attr("fill","#adb5bd").attr('font-weight',600).attr('font-size',"14px")
                .text("Mint")
            //draw back flow
            let bg_flow_G = detail_d_G.append("g").classed('bg_flow',true)
            //draw path
            let get_y = (address,length,index)=>{//get path y
                return y_scale(each_width[address][1])-length*gap_width*0.5+(index+0.5)*gap_width
            }
            let offset = x_scale(0.5)-x_scale(0)
            address_list.forEach(address=>{
                let nft_set = new_data[address][0]
                let nft_flow = new_data[address][1]
                let key_list = Object.keys(nft_flow).sort((a,b)=>{
                        return str_to_tran_index(a)-str_to_tran_index(b)
                    })
                let new_flow = Object.keys(nft_flow)
                        .filter(tran_str=>{
                            let this_id = str_to_tran_index(tran_str)
                            return this_id>=start_i && this_id<=end_i
                            })
                        .sort((a,b)=>{
                            return that.timePaser(a.split('+')[1])-that.timePaser(b.split('+')[1])
                        })
                let last_str = key_list[key_list.indexOf(new_flow[0])-1] 
                
                //draw bg flow
                let bg_list = []
                let last_count = nft_flow[last_str]?nft_flow[last_str].length:0
                for(let i=start_i;i<=end_i;i++){
                    if(nft_flow[tran_str_list[i]]){                    
                        if(i==start_i){
                            if(nft_flow[last_str]){
                                let len = nft_flow[last_str].length
                                if(len>0){
                                    bg_list.push([start_i,len])
                                    last_count = len
                                }else{
                                    bg_list.push([start_i,0])
                                }                                
                            }
                        }
                        bg_list.push([i,nft_flow[tran_str_list[i]].length])
                        last_count = nft_flow[tran_str_list[i]].length
                    }else{
                        bg_list.push([i,last_count])
                    }
                }
                let bg_area = d3.area()
                    .x(d=>x_scale(d[0]))
                    .y1(d=> d[1]>0?get_y(address,d[1],-0.9):get_y(address,[1],0))
                    .y0(d=> d[1]>0?get_y(address,d[1],d[1]-0.1):get_y(address,[1],0))
                    .curve(d3.curveBumpX)
                
                bg_flow_G.append('path').classed('bg_flow',true)
                    .attr('d',bg_area(bg_list))
                    .attr('fill',flow_color(address))
                    .attr("opacity",0.5)
                //draw inner path
                nft_set.forEach(nft_id=>{
                    let path_list = []
                    let path_d = ''
                    let last_y;
                    //last
                    if(last_str){
                        let last_len = nft_flow[last_str].length
                        let last_index = nft_flow[last_str].indexOf(nft_id)
                        let first_index = nft_flow[new_flow[0]].indexOf(nft_id)
                        if(last_index>-1){
                            path_d = `M${x_scale(start_i)} ${get_y(address,last_len,last_index)} `
                            last_y = get_y(address,last_len,last_index) 
                        }
                    }
                    new_flow.forEach((tran_str,tran_index)=>{
                        let index = nft_flow[tran_str].indexOf(nft_id)
                        let nft_len = nft_flow[tran_str].length
                        let temp_x = x_scale(str_to_tran_index(tran_str))
                        if(index>-1){
                            if(path_d.length>0){     
                                if(str_to_tran_index(tran_str)!=start_i){
                                    path_d += `H${temp_x-2*offset} C${temp_x-offset} ${last_y}, ${temp_x-offset} ${get_y(address,nft_len,index)} ,${temp_x} ${get_y(address,nft_len,index)}`
                                }else{
                                    path_d = `M${temp_x} ${get_y(address,nft_len,index)}`
                                }
                            }else{
                                if(str_to_tran_index(tran_str)==start_i){
                                    path_d = `M${temp_x} ${get_y(address,nft_len,index)}`
                                }else{
                                    path_d = `M${temp_x-0.5*offset} ${get_y(address,nft_len,index)}`
                                }
                            }
                            last_y = get_y(address,nft_len,index)                            
                        }else{
                            if(path_d.length>0){
                                if(str_to_tran_index(tran_str)>start_i){
                                    path_d += `H${temp_x-1.5*offset}`
                                    path_list.push(path_d)
                                    path_d = ''
                                }else{
                                    path_d = ''
                                }
                            }
                        }
                        if(tran_index==new_flow.length-1){
                            if(path_d.length>0){
                                path_d += `H${x_scale(end_i)}`
                                path_list.push(path_d)
                                path_d = ''
                            }
                        }
                    })
                    //draw
                    let each_flow_G = detail_d_G.append('g').classed(`g-${address}-${nft_id}`,true)
                    path_list.forEach(p=>{
                        each_flow_G.append('path').classed(`p-${address}-${nft_id}`,true)
                            .attr("d",p).classed(`token${nft_id}`,true).classed("token",true)
                            .attr('stroke-width',path_width*0.8)
                            .attr('stroke',trans_color(address))
                            .attr('fill','none')
                            .attr('opacity',1)
                            .on("mouseover",function(_event){
                                that.highlight_NFT(_event,nft_id)
                            })
                            .on('mousemove',function(_event){
                                that.highlight_NFT(_event,nft_id)
                            })
                            .on("mouseout",function(_event){
                                that.un_highlight_NFT(nft_id)
                            })
                    })
                })
            })
    
            // let zero_line = y_scale(0)-2*gap_width
            // let other_line = y_scale(stack_nft)+2*gap_width
            let zero_line = y1+1
            let other_line = y2-1
            // detail_d_G.append('line')
            //     .attr('x1',x_scale(start_i))
            //     .attr("x2",x_scale(end_i))
            //     .attr('y1',zero_line)
            //     .attr('y2',zero_line)
            //     .attr('stroke',that.color_scheme.boarder_line)
            //     .attr('stroke-width',2)
            detail_d_G.append('line')
                .attr('x1',x_scale(start_i))
                .attr("x2",x_scale(end_i))
                .attr('y1',other_line)
                .attr('y2',other_line)
                .attr('stroke',that.color_scheme.boarder_line)
                .attr('stroke-width',2)
            //draw trans
            let trans_d = (id,from,to,time_str)=>{
                let tran_str = trans_str(id,time_str,from)
                let x_0 = x_scale(str_to_tran_index(tran_str))
                let from_stack,from_index,y1,to_stack,to_index,y2
                if(address_list.indexOf(from)>-1){
                    let key_list = Object.keys(new_data[from][1]).sort((a,b)=>{
                        return str_to_tran_index(a)-str_to_tran_index(b)
                    })
                    let last_tran_str,from_stack
                    if(key_list.indexOf(tran_str)>=1){
                        last_tran_str = key_list[key_list.indexOf(tran_str)-1]
                        from_stack = new_data[from][1][last_tran_str]
                    }else{
                        from_stack = []
                    }
                    from_index = from_stack.indexOf(id)
                    y1 = get_y(from,from_stack.length,from_index)
                }else if(from=="0x0000000000000000000000000000000000000000"){
                    y1 = zero_line
                }else{
                    y1 = other_line
                }
                if(address_list.indexOf(to)>-1){
                    to_stack = new_data[to][1][tran_str]
                    to_index = to_stack.indexOf(id)
                    y2 = get_y(to,to_stack.length,to_index)
                }else if(to=="0x0000000000000000000000000000000000000000"){
                    y2 = zero_line
                }else{
                    y2 = other_line
                }
                return [`M${x_0-1.5*offset} ${y1} L${x_0-0.5*offset} ${y2}`,[x_0-1.5*offset,y1],[x_0-0.5*offset,y2]]
            }
            let path_data = stack_trans.filter(item=>str_to_tran_index(trans_str(item['id'],item['time_stamp'],item['from_address']))>start_i&&str_to_tran_index(trans_str(item['id'],item['time_stamp'],item['from_address']))<=end_i)
            let min_p = Math.min(...path_data.filter(item=>item['status']=='Sale').map(item=>item['value'])) 
            let max_p = Math.max(...path_data.filter(item=>item['status']=='Sale').map(item=>item['value'])) 
            let p_scale = d3.scaleLinear().domain([min_p,max_p]).range([0.3,1])
            //add gradient
            let def_set = new Set([])
            let zero_address = "0x0000000000000000000000000000000000000000"
            let addr_len = old_address_list.length
            let type_check = (address)=>{
                let addr_index = old_address_list.indexOf(address)
                if(addr_index>-1){
                    return addr_index
                }else if(address == zero_address){
                    return -1
                }else{
                    return addr_len
                }
            }
            path_data.forEach(item=>{
                let from = item['from_address'],to = item['to_address']
                let from_index = type_check(from)
                let to_index = type_check(to)
                let start_ = from_index>to_index?to_index:from_index
                let end_ = from_index>to_index?from_index:to_index
                def_set.add(`${start_}+${end_}`)
            })
            detail_G.select('defs').remove()
            let trans_defs = detail_d_G.append('defs')
            // let brush_gradient = defs.append('linearGradient').attr('id','brush').attr('x1',0).attr('x2',0).attr('y1',0).attr('y2',1)
            // brush_gradient.append('stop').attr("offset",'0%').attr("stop-color",that.color_scheme.brush_con).attr('stop-opacity',"0.4")
            // brush_gradient.append('stop').attr("offset",'100%').attr("stop-color",that.color_scheme.brush_con).attr('stop-opacity',"0.2")
            Array.from(def_set).forEach(item=>{
                let res = item.split('+')
                let Grad_ = trans_defs.append('linearGradient').attr('id',`G${item}`).attr('x1',0).attr('x2',0).attr('y1',0).attr('y2',1)
                Grad_.append("stop").attr("offset",'0%').attr("stop-color",trans_color(old_address_list[parseInt(res[0])]))
                Grad_.append("stop").attr("offset",'100%').attr("stop-color",trans_color(old_address_list[parseInt(res[1])]))
            })
            //draw path
            detail_d_G.selectAll("path.trans")
                .data(path_data)
                .join('path').classed("trans",true)
                .attr('class',d=>`token${d['id']}`).classed('token',true)
                .attr('d',d=>trans_d(d['id'],d['from_address'],d['to_address'],d['time_stamp'])[0])
                .attr('stroke',d=>{
                    let i_1 = type_check(d['from_address'])>type_check(d['to_address'])?type_check(d['to_address']):type_check(d['from_address'])
                    let i_2 = type_check(d['from_address'])>type_check(d['to_address'])?type_check(d['from_address']):type_check(d['to_address'])
                    return `url(#G${i_1}+${i_2})`
                })
                .attr('stroke-width',path_width*0.4)
                .attr('stroke-dasharray',d=>d['status']=='Transfer'?'4,4':'none')
                .attr('fill','none')
                .each(function(ddd){
                    let nft_id = ddd['id']
                    d3.select(this).on("mouseover",function(_event){
                                that.highlight_NFT(_event,nft_id)
                            })
                            .on('mousemove',function(_event){
                                that.highlight_NFT(_event,nft_id)
                            })
                            .on("mouseout",function(_event){
                                that.un_highlight_NFT(nft_id)
                            })
                })

                // .attr("opacity",d=>d['status']=='Sale'?p_scale(d['value']):1)
        
            detail_d_G.selectAll('circle.in')
                .data(path_data)
                .join('circle').classed("in",true)
                .attr('class',d=>`token${d['id']}`).classed('token',true)
                .attr('cx',d=>trans_d(d['id'],d['from_address'],d['to_address'],d['time_stamp'])[2][0])
                .attr('cy',d=>trans_d(d['id'],d['from_address'],d['to_address'],d['time_stamp'])[2][1])
                .attr('r',path_width*0.3)
                .attr('stroke','white').attr('stroke-width',path_width*0.2)
                .attr("fill",d=>{
                    if(d['from_address']==d['to_address']&&d['status']=="Sale"){
                        return 'red'
                    }
                    return trans_color(d['to_address'])})
                .each(function(ddd){
                    let nft_id = ddd['id']
                    d3.select(this).on("mouseover",function(_event){
                                that.highlight_NFT(_event,nft_id)
                            })
                            .on('mousemove',function(_event){
                                that.highlight_NFT(_event,nft_id)
                            })
                            .on("mouseout",function(_event){
                                that.un_highlight_NFT(nft_id)
                            })
                })
            detail_d_G.selectAll('circle.out')
                .data(path_data)
                .join('circle').classed("out",true)
                .attr('class',d=>`token${d['id']}`).classed('token',true)
                .attr('cx',d=>trans_d(d['id'],d['from_address'],d['to_address'],d['time_stamp'])[1][0])
                .attr('cy',d=>trans_d(d['id'],d['from_address'],d['to_address'],d['time_stamp'])[1][1])
                .attr('r',path_width*0.3)
                .attr('stroke',d=>trans_color(d['from_address'])).attr('stroke-width',path_width*0.2)
                .attr("fill",'white')
                .each(function(ddd){
                    let nft_id = ddd['id']
                    d3.select(this).on("mouseover",function(_event){
                                that.highlight_NFT(_event,nft_id)
                            })
                            .on('mousemove',function(_event){
                                that.highlight_NFT(_event,nft_id)
                            })
                            .on("mouseout",function(_event){
                                that.un_highlight_NFT(nft_id)
                            })
                })
        },
        addCircularBrush(svg,G,CX,CY,R,r_scale,c_scale,use_address){
            let that = this
            let radial_trans = (x,y)=>{
                let theta_x = x-CX,theta_y = CY-y
                let r = Math.sqrt(theta_x*theta_x + theta_y*theta_y) 
                let sin = theta_x/r
                let angle = Math.asin(sin)
                if(theta_x>=0&&theta_y>=0){
                    return [angle,r]
                }else if(theta_x>=0&&theta_y<0){
                    return [Math.PI-angle,r]
                }else if(theta_x<0&&theta_y>=0){
                    return [2*Math.PI+angle,r]
                }else{
                    return [Math.PI-angle,r]
                } 
            }
            let coordinate_trans = (a,r)=>{
                let x = CX+r*Math.cos(a-Math.PI*0.5)
                let y = CY+r*Math.sin(a-Math.PI*0.5)
                return [x,y]
            }
            let arc_area = d3.arc()
            let brush_G = G.append("g").classed("brush",true)
            let c_Brush = brush_G.append('circle').classed('brush',true)
                .attr("cx",CX)
                .attr('cy',CY)
                .attr("r",R)
                .attr('fill','white')
                .attr('opacity',0)
            //address selection fuction         
            let address_select = (a,c)=>{
                return use_address.filter(item=>{
                let b=c_scale(item)>1.5*Math.PI?c_scale(item)-1.5*Math.PI:c_scale(item)+0.5*Math.PI
                    if(b>=a&&b<=c){
                        return true
                    }else if(c<0&&b>=2*Math.PI+c&&b<=2*Math.PI){
                        return true
                    }else if(c>2*Math.PI&&b>0&&b<=c-2*Math.PI){
                        return true
                    }else{
                        return false
                    }
                })
            }
            //brush events
            // let brush_select = {}
            c_Brush.on('mousedown.brush',function(d){
                d3.selectAll('.group').remove()
                let start_x = d3.pointer(d)[0]
                let start_y = d3.pointer(d)[1]
                let radial_result = radial_trans(start_x,start_y)
                //arc drawing
                let arc_d =  arc_area({
                    innerRadius:radial_result[1],
                    outerRadius:radial_result[1],
                    startAngle:radial_result[0],
                    endAngle:radial_result[0],
                })
                brush_G.append('path').classed('brush_area',true)
                    .attr('d',arc_d)
                    .attr('fill',that.color_scheme.brush_area)
                    .attr('opacity',0.4)
                    .attr('stroke','white').attr('stroke-width',2)
                    .attr('transform',`translate(${CX} ${CY})`)
                    .on('dblclick',function(){
                        console.log('dbclick')
                        d3.select(this).remove()
                    })
                //events bunding
                let brush_direction // true for clockwise
                let no_change = false
                let last_x,last_y
                brush_G.on('mousemove.brush',function(d){
                    if(!last_x){
                        last_x = start_x
                        last_y = start_y
                    }
                    let move_x = d3.pointer(d)[0]
                    let move_y = d3.pointer(d)[1]
                    //change the brush area
                    let new_radial_result = radial_trans(move_x,move_y)
                    let start_a = new_radial_result[0]>radial_result[0]?radial_result[0]:new_radial_result[0]
                    let end_a = new_radial_result[0]>radial_result[0]?new_radial_result[0]:radial_result[0]
                    if(brush_direction=='clockwise'){
                        if(new_radial_result[0]<radial_result[0]){
                            let over_check = last_y<=CY&&move_y<=CY&&last_x<=CX&&move_x>=CX
                            if(over_check){
                                no_change=true
                            }
                            if(no_change){
                                start_a = radial_result[0]
                                end_a = 2*Math.PI+new_radial_result[0]                                    
                            }
                        }else{
                            no_change = false
                        }
                    }else if(brush_direction=='counter-clockwise'){
                        if(new_radial_result[0]>radial_result[0]){
                            let back_check = last_y<=CY&&move_y<=CY&&last_x>=CX&&move_x<=CX
                            if(back_check){
                                no_change = true                                
                            }
                            if(no_change){
                                start_a = radial_result[0]
                                end_a = new_radial_result[0]-2*Math.PI                                
                            }
                        }else{
                            no_change = false
                        }
                    }
                    let arc_info = {
                        innerRadius:new_radial_result[1]>radial_result[1]?radial_result[1]:new_radial_result[1],
                        outerRadius:new_radial_result[1]>radial_result[1]?new_radial_result[1]:radial_result[1],
                        startAngle:start_a,
                        endAngle:end_a,
                    }
                    let new_arc_d =  arc_area(arc_info)
                    brush_G.select('path.brush_area')
                        .attr('d',new_arc_d)
                    if(!no_change){
                        brush_direction = new_radial_result[0]>radial_result[0]?'clockwise':'counter-clockwise'
                    }
                    last_x = move_x
                    last_y = move_y
                    brush_G.select('path.brush_area').datum(arc_info)
                    // brush_select = arc_info
                })
                //bundle brush mouseup
                brush_G.on('mouseup.brush',function(d){
                    brush_G.on('mousemove.brush',null) 
                    brush_G.on('mouseup.brush',null)
                    let brush_select = brush_G.select('path.brush_area').data()[0]
                    let a=brush_select['startAngle'],c=brush_select['endAngle']
                    let selected_address = address_select(a,c)
                    let arc = d3.arc().cornerRadius(R*0.02)
                    let a_central = (a+c)*0.5
                    let connection_d = `M${coordinate_trans(a_central,R*1.04)[0]} ${coordinate_trans(a_central,R*1.04)[1]}`
                    // connection_d += `L${coordinate_trans(a_central,R*1.1)[0]} ${coordinate_trans(a_central,R*1.1)[1]} `
                    let detail_loc = that.detail_loc
                    let y_central = detail_loc[1]-90
                    let obj_angle = radial_trans(CX+R,y_central)[0]
                    let r_line = R*1.06
                    if(y_central>CY-R&&y_central<CY+R){//if object in the range of d
                        if(a_central<=Math.PI*0.1||a_central>=Math.PI*1.25){
                            connection_d += `Q${coordinate_trans(a_central,r_line)[0]} ${coordinate_trans(a_central,r_line)[1]},${coordinate_trans(a_central+0.05,r_line)[0]} ${coordinate_trans(a_central+0.05,r_line)[1]}` 
                            // if(y_central<=CY){
                                connection_d+=`A${r_line} ${r_line} 0 0 1 ${coordinate_trans(obj_angle-0.5,r_line)[0]} ${coordinate_trans(obj_angle-0.5,r_line)[1]}`
                                connection_d += `Q${coordinate_trans(obj_angle,r_line)[0]} ${y_central},${CX+1.11*R} ${y_central}`
                                // connection_d += `L${CX+1.11*R} ${y_central}`
                            // }
                        }else if(a_central>0.4*Math.PI&&a_central<Math.PI*1.25){
                            connection_d += `Q${coordinate_trans(a_central,r_line)[0]} ${coordinate_trans(a_central,r_line)[1]},${coordinate_trans(a_central-0.05,r_line)[0]} ${coordinate_trans(a_central-0.05,r_line)[1]}` 
                            // if(y_central<=CY){
                                connection_d+=`A${r_line} ${r_line} 0 0 0 ${coordinate_trans(obj_angle+0.2,r_line)[0]} ${coordinate_trans(obj_angle+0.2,r_line)[1]}`
                                connection_d += `Q${coordinate_trans(obj_angle,r_line)[0]} ${y_central},${CX+1.11*R} ${y_central}`
                                connection_d += `L${CX+1.11*R} ${y_central}`
                            // }
                        }else{
                            let middle_X = 0.5*(coordinate_trans(a_central,R*1.07)[0] + CX+1.11*R)
                            connection_d += `C${middle_X} ${coordinate_trans(a_central,R*1.07)[1]}, ${middle_X} ${y_central}, ${CX+1.11*R} ${y_central}`
                        }
                    }
                    //add connection
                    if(selected_address.length>0){
                        brush_G.append('line').classed('group',true)
                            .attr('x1',CX).attr('y1',CY).attr('x2',coordinate_trans(a+0.002,R)[0]).attr('y2',coordinate_trans(a+0.002,R)[1])
                            .attr('stroke',that.color_scheme.brush_connection[1]).attr('stroke-width',1.5)
                            .attr("stroke-dasharray",'3,1')
                        brush_G.append('line').classed('group',true)
                            .attr('x1',CX).attr('y1',CY).attr('x2',coordinate_trans(c-0.002,R)[0]).attr('y2',coordinate_trans(c-0.002,R)[1])
                            .attr('stroke',that.color_scheme.brush_connection[1]).attr('stroke-width',1.5)
                            .attr("stroke-dasharray",'3,1')
                        brush_G.append("path").classed('group',true)
                            .attr('d',connection_d).attr('fill','none').attr("stroke",that.color_scheme.brush_connection[0]).attr('stroke-width',2)                 
                        brush_G.append('path').classed('group',true)
                            .attr('d',arc({
                                innerRadius:1.01*R,
                                outerRadius:1.04*R,
                                startAngle:a,
                                endAngle:c,
                            }))
                            .attr('fill',that.color_scheme.brush_connection[0]).attr('transform',`translate(${CX} ${CY})`)
                        
                    }
                    //redraw the detail
                    that.drawDetail(detail_loc[0],detail_loc[1],detail_loc[2],svg,selected_address,r_scale.invert(brush_select['innerRadius']),r_scale.invert(brush_select['outerRadius']))     
                })
            })       
        },
        highlight_NFT(_event,id){
            let res = d3.pointer(_event)
            d3.selectAll(`.token`).attr('opacity',0.3)
            d3.selectAll(`.token${id}`).attr('opacity',1)
            d3.select('div.tooltip').select('p').remove()
            d3.select('div.tooltip').append("p").text(`Token ID: ${id}`)
            d3.select('div.tooltip').attr('style',`transform:translate(${parseInt(res[0])-20}px,${parseInt(res[1])-30}px);visibility:visible`)

        },
        un_highlight_NFT(id){
            d3.selectAll(`.token`).attr('opacity',1)
            d3.select('div.tooltip').attr('style',`visibility:hidden`)
        },
        time_init(){
            let time_list =  Object.keys(this.MTrans).map(item=>{
                let date_split = item.split("-")
                let date = new Date(date_split[0],date_split[1]-1,15,0)
                return date.getTime()
            })
            this.range = [Math.min(...time_list),Math.max(...time_list)]            
        },
        hover_addr(_event,addr){
            let res = d3.pointer(_event)
            d3.select('div.tooltip').select('p').remove()
            d3.select('div.tooltip').append("p").text(`Address: ${addr}`)
            d3.select('div.tooltip').attr('style',`transform:translate(${parseInt(res[0])}px,${parseInt(res[1])+10}px);visibility:visible`)

        },
        out_addr(){
            d3.select('div.tooltip').attr('style',`visibility:hidden`)
        }
    },
    created(){
    },
    mounted(){
        window.addEventListener("resize",this.setSvg);
        this.time_init()
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
.view_title {
  color: #606e79;
  /* font-weight: bolder; */
}
/* .selection {
    fill: #adb5bd;
    opacity: 1;
}
.handle {
    fill: #775039;
    width:2px;
} */
/* text {
    font-family:Arial, Helvetica, sans-serif;
    font-weight: 600;
    color: #606e79;
    font-size: 15px;
} */
p.control {
    font-family:Arial, Helvetica, sans-serif;
    font-weight: 600;
    color: #606e79;
    font-size:15px;
}
.tooltip {
    position: absolute;
    visibility: hidden;
    margin-left: 0px;
    margin-top: 0px;
    text-anchor: middle;
    background-color: black;
    color: white;
    border-radius: 5px;
    font-size: 15px;
    width: auto;
    height: 25px;
    padding-left: 8px;
    padding-right: 8px;
    text-align: center;
}
</style>