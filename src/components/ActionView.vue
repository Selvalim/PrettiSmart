<template>
    <div style="height:100%;width:100%;background:white;" ref="container" class="display-flex">
        <div class="view_title" style="margin-left:-15px;margin-top:-11px;height:20px;width:100%;
        background:#e9ecef;position: absolute;font: 1.2em sans-serif;text-align:center;font-weight: 600;border-radius: 5px;">
            Path Detail View
        </div> 
        <div class="tooltip_action">
               <p>111</p>
        </div>
        <div style="overflow: auto;">
            <svg class="Action" :height="this.svgHeight" :width="this.svgWidth"></svg>        
        </div>
    </div>
</template>

<script>
import {NInputNumber,NButton,NDatePicker,NSwitch,NSelect,NCard} from 'naive-ui'
import * as d3 from "d3"
// import * as Snap from 'snapsvg-cjs'

export default {
    name:"ActionView",
    components:{ NInputNumber,NButton ,NDatePicker,NSwitch,NSelect,NCard},
    props:['actColor','actions','selected_path','selected_path_data'],
    data(){
        return {
            svgHeight:'0',
            svgWidth:'0',
            margin:{top:20,bottom:20,left:0,right:5},
            actSize:{
                'READ':8,
                'WRITE':8,
                'PAY':8,
                'CONS':8,
                'LINE':2,
                'STROKE':1.5,
                'SLOT': 20,
                'GAP':1,
                'TEXT':10
            },
            width:0,
            height:0,
            storage_y:0,
            Action_Loc:{},
            lil_height:0,
            caller_slot:[],
            pay_slot:[],
            sorted_acitons:{},
        }
    },
    computed:{
    },
    watch:{
        selected_path:function(newVal, oldVal){
            if(newVal != oldVal){
                this.drawInit()
            }
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
            this.drawInit()
        },
        drawInit(){
            d3.select('g.glyph').remove()//remove g
            let that = this
            // console.log(that.actions)
            // init data
            let path = JSON.parse(Object.keys(that.actions)[that.selected_path])
            console.log('path:',path)
            let data = Object.values(that.actions)[that.selected_path] //raw data 
            // let sorted_actions = data['sortedActions'].filter(item=>item[0]!='READ')
    
            //init svg
            let svg = d3.select("svg.Action")
                .attr("width",that.svgWidth)
                .attr("height",that.svgHeight)
            let width = that.svgWidth - that.margin.left - that.margin.right
            this.width = width
            let height = that.svgHeight - that.margin.top - that.margin.bottom
            this.height = height
            let path_y = height*0.4
            this.lil_height = 0.1*that.actSize['SLOT']
            // let sorted_actions = data['sortedActions']
            let path_DATA = this.selected_path_data
            if(Object.keys(path_DATA).length>0){
                let storage = that.actions['storage']
                this.sorted_acitons = path_DATA['sorted_actions']
                // console.log(path_DATA,this.sorted_acitons)



                this.drawActions3(svg,width,height,path_y,path,data,path_DATA)
                // this.drawStorage3(svg,this.width,this.height,path_x,this.storage_x,storage,path_DATA['sorted_actions'],this.Action_Loc)
                this.drawStorage4(svg,this.width,this.height,path_y,this.storage_y,storage,path_DATA['sorted_actions'],this.Action_Loc)
                let glyph_G = svg.append('g').classed('glyph',true)
                Object.keys(this.Action_Loc).forEach(item=>{
                    that.drawGlyphs(glyph_G,this.Action_Loc[item].x,this.Action_Loc[item].y,this.Action_Loc[item].act)
                })

            }

            this.drawLegends(svg,width)
        },
        drawLegends(svg,width){
            d3.select('g.legend').remove()
            let that = this
            let left = that.margin.left + that.actSize['PAY']
            let legend_G = svg.append('g').classed('legend',true)
            let gap = 14
            let font_size = 10
            let y_cursor = that.margin.top+gap
            legend_G.append('text')
                        .attr('x',left+that.actSize['PAY']*6).attr('y',y_cursor+1)
                        .attr('text-anchor','start').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',font_size)
                .text('Write Information (Update Information)')
            that.drawGlyphs(legend_G,left+that.actSize['PAY'],y_cursor,['WRITE'])
            that.drawGlyphs(legend_G,left+that.actSize['PAY']*4,y_cursor,['WRITE','update'])
            y_cursor += font_size + gap
            legend_G.append('text')
                        .attr('x',left+that.actSize['PAY']*6).attr('y',y_cursor+1)
                        .attr('text-anchor','start').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',font_size)
                .text('Invoke Payment (Pay Back)')
            that.drawGlyphs(legend_G,left+that.actSize['PAY'],y_cursor,['PAY'])
            that.drawGlyphs(legend_G,left+that.actSize['PAY']*4,y_cursor,['PAY','callback'])
            y_cursor += font_size + gap
            legend_G.append('text')
                        .attr('x',left+that.actSize['PAY']*3).attr('y',y_cursor+1)
                        .attr('text-anchor','start').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',font_size)
                .text('Check Constraint')
            that.drawGlyphs(legend_G,left+that.actSize['PAY'],y_cursor,['CONS'])
            y_cursor += font_size + gap
            legend_G.append('text')
                        .attr('x',left+that.actSize['PAY']*3).attr('y',y_cursor+1)
                        .attr('text-anchor','start').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',font_size)
                .text('Read Information')
            that.drawGlyphs(legend_G,left+that.actSize['PAY'],y_cursor,['READ'])
            //STORAGE
            y_cursor = that.margin.top+gap
            // y_cursor += font_size + gap *1.5
            legend_G.append('text')
                        .attr('x',width-that.actSize['PAY']*4).attr('y',y_cursor)
                        .attr('text-anchor','end').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',font_size)
                .text('Variable')
            that.drawSlots(legend_G,width-that.actSize['PAY']*2-that.actSize['SLOT']*0.4,y_cursor-that.actSize['SLOT']*0.5,['variable'],that.lil_height,false)
            y_cursor += font_size + gap *1.5
            legend_G.append('text')
                        .attr('x',width-that.actSize['PAY']*4).attr('y',y_cursor)
                        .attr('text-anchor','end').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',font_size)
                .text('Array')
            that.drawSlots(legend_G,width-that.actSize['PAY']*2-that.actSize['SLOT']*0.4,y_cursor-that.actSize['SLOT']*0.5,['array'],that.lil_height,false)
            y_cursor += font_size + gap *1.5
            legend_G.append('text')
                        .attr('x',width-that.actSize['PAY']*4).attr('y',y_cursor)
                        .attr('text-anchor','end').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',font_size)
                .text('Mapping')
            that.drawSlots(legend_G,width-that.actSize['PAY']*2-that.actSize['SLOT']*0.4,y_cursor-that.actSize['SLOT']*0.5,['mapping'],that.lil_height,false)
            //contents
            legend_G.append('text')
                        .attr('x',width-that.actSize['PAY']*19).attr('y',y_cursor)
                        .attr('text-anchor','end').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',font_size)
                .text('Unrelated')
            that.drawSlotContents(legend_G,width-that.actSize['PAY']*16.5,y_cursor-that.actSize['SLOT']*0.5,that.actSize['SLOT'],'---')
            y_cursor -= font_size + gap *1.5
            legend_G.append('text')
                        .attr('x',width-that.actSize['PAY']*19).attr('y',y_cursor)
                        .attr('text-anchor','end').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',font_size)
                .text('CALLVALUE (Related)')
                that.drawSlotContents(legend_G,width-that.actSize['PAY']*16.5,y_cursor-that.actSize['SLOT']*0.5,that.actSize['SLOT'],'CALLVALUE')
            that.drawSlotContents(legend_G,width-that.actSize['PAY']*13,y_cursor-that.actSize['SLOT']*0.5,that.actSize['SLOT'],'CALLVALUE---')
            y_cursor -= font_size + gap *1.5
            legend_G.append('text')
                        .attr('x',width-that.actSize['PAY']*19).attr('y',y_cursor)
                        .attr('text-anchor','end').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',font_size)
                .text('CALLER (Related)')
            that.drawSlotContents(legend_G,width-that.actSize['PAY']*16.5,y_cursor-that.actSize['SLOT']*0.5,that.actSize['SLOT'],'CALLER')
            that.drawSlotContents(legend_G,width-that.actSize['PAY']*13,y_cursor-that.actSize['SLOT']*0.5,that.actSize['SLOT'],'CALLERxxx')

        },
        drawActions3(svg,width,height,path_y,o_path,data,path_DATA){
            let sorted_actions = path_DATA['sorted_actions']

            // console.log(`actions:`,sorted_actions)
            // console.log(path_DATA)
            //remove g
            d3.select('g.act_G').remove()
            let that = this
            let act_G = svg.append('g').classed("act_G",true)

            let Action_Loc = {}
            let cursor = 0
            let cursor_height = 0
            let x_mapping = d3.scaleLinear().domain([0,1]).range([0,1])
            //deal with the data ===========================================================================================
            // let loop_point = [...data['loop']].sort((a,b)=>o_path.indexOf(parseInt(a))-o_path.indexOf(parseInt(b)))
            let loop_point = path_DATA['loop']

            if(loop_point.length>0){// if there is a loop
                let none_loop_segments = path_DATA['none_loop_segments']
                let loop_segments = path_DATA['loop_segments']

                //end of segments=====================================================================================================
                // console.log(o_path,loop_point,none_loop_segments,loop_segments)

                //CACULATE THE LOCATION
                let max_loop_len = 0
                let loop_range = []
                none_loop_segments.forEach((seg,seg_idx)=>{
                    if(seg_idx==0){ //before loop
                        seg[4].forEach((act)=>{
                            Action_Loc[cursor] = {
                                y: path_y,
                                x: cursor_height + that.actSize[act[0]]+ that.actSize['STROKE'] + that.actSize['GAP'],
                                act:act
                            }
                            cursor_height += 2*(that.actSize[act[0]]+that.actSize['STROKE'] + that.actSize['GAP'])
                            cursor += 1
                        })
                    }else{
                        let loop_data = loop_segments.slice((seg_idx-1)*2,(seg_idx-1)*2+2)
                        let len = loop_data[0][4].length
                        let data1 = loop_data[0][4]
                        let data2 = loop_data[1][4]
                        // adjust the size of looop
                        let b = 2.5 + (len-2)*0.1
                        let pathData = that.ArchimedeanSpiral(0,b,0.01,path_y,cursor_height,len)
                        // keep the parameter of spiral
                        loop_range.push([0,b,0.01,path_y,cursor_height,len])
                        cursor_height = pathData[2][1] + that.actSize['PAY']
                        // cursor += loop_data[0][4].length + loop_data[1][4].length

                        let round1 = pathData[3][0]
                        let round2 = pathData[3][1]
                        round1.forEach((item,idx)=>{
                            Action_Loc[cursor] = {
                                x:item[0],
                                y:item[1],
                                act:data1[idx]
                            }
                            cursor += 1

                        })
                        round2.forEach((item,idx)=>{
                            Action_Loc[cursor] = {
                                x:item[0],
                                y:item[1],
                                act:data2[idx]
                            }
                            cursor += 1
                        })
                        seg[4].forEach((act)=>{
                            Action_Loc[cursor] = {
                                y: path_y,
                                x: cursor_height + that.actSize[act[0]]+ that.actSize['STROKE'] + that.actSize['GAP'],
                                act:act
                            }
                            cursor_height += 2*(that.actSize[act[0]]+that.actSize['STROKE'] + that.actSize['GAP'])
                            cursor += 1
                        })
                    }
                })
                //avoid too big spiral
                if(max_loop_len>10){
                    let limit = max_loop_len*10
                    x_mapping = d3.scaleLinear().domain([-limit,cursor_height+limit]).range([that.margin.left,that.margin.left+width])
                }else{
                    x_mapping = d3.scaleLinear().domain([0,cursor_height]).range([that.margin.left,that.margin.left+width])
                }

                let ratio = (x_mapping(1)-x_mapping(0))
                let line_start = 0
                loop_range.forEach(item=>{
                    // draw the line
                    act_G.append("line")
                        .attr('y1',path_y).attr('x1',line_start)
                        .attr('y2',path_y).attr('x2',x_mapping(item[4]))
                        .attr('stroke',that.actColor['LINE'])
                        .attr('stroke-width',that.actSize['LINE'])

                    let pathData = that.ArchimedeanSpiral(item[0],item[1]*ratio,item[2],item[3],x_mapping(item[4]),item[5],x_mapping)
                    line_start = pathData[2][1] + that.actSize['PAY']
                    //draw the inner line
                    act_G.append("line")
                        .attr('y1',path_y).attr('x1',pathData[2][2])
                        .attr('y2',path_y).attr('x2',pathData[2][3]-that.actSize['PAY'])
                        .attr('stroke',that.actColor['LINE'])
                        .attr('stroke-width',that.actSize['LINE'])
                        .attr('stroke-dasharray','2,1')
                    //draw the spiral
                    act_G.append('path')
                        .attr("d",pathData[0]).attr('fill','none').attr("stroke-width",that.actSize['LINE']).attr('stroke',that.actColor['LINE'])
                    act_G.append('path')
                        .attr("d",pathData[1]).attr('fill','none').attr("stroke-width",that.actSize['LINE']).attr('stroke','black')
                })
                // draw the  last line
                act_G.append("line")
                        .attr('y1',path_y).attr('x1',line_start)
                        .attr('y2',path_y).attr('x2',that.svgWidth)
                        .attr('stroke',that.actColor['LINE'])
                        .attr('stroke-width',that.actSize['LINE'])
                let new_Action_Loc = {}
                Object.keys(Action_Loc).forEach(idx=>{
                    let action_data = Action_Loc[idx]
                    let new_y = path_y + (action_data.y - path_y)*ratio
                    // that.drawGlyphs(act_G,new_x,y_mapping(action_data.y),action_data.act)
                    new_Action_Loc[idx] = {
                        y:new_y,
                        x:x_mapping(action_data.x),
                        act:action_data.act
                    }
                })
                Action_Loc = new_Action_Loc

            }else{// if there is no loop
                console.log('there is no loop')
                x_mapping = d3.scaleLinear().domain([-1,sorted_actions.length]).range([that.margin.left,that.margin.left+width])
                act_G.append("line")
                        .attr('y1',path_y).attr('x1',0)
                        .attr('y2',path_y).attr('x2',that.svgWidth)
                        .attr('stroke',that.actColor['LINE'])
                        .attr('stroke-width',that.actSize['LINE'])
                sorted_actions.forEach((act,idx)=>{
                    Action_Loc[idx] = {
                        y:path_y,
                        x: x_mapping(idx),
                        act:act
                    }
                    // that.drawGlyphs(act_G,path_x,y_mapping(idx),act)
                })
            }
            
            this.storage_y = height*0.95
            this.Action_Loc = Action_Loc

        },
        drawStorage4(svg,width,height,path_y,storage_y,storage,sorted_actions,Action_Loc){
            //remove g
            d3.select('g.storage_G').remove()
            let that = this
            let storage_G = svg.append('g').classed("storage_G",true)
            // storage[5] = ['mapping']
            let slots = Object.keys(storage)
            let strip = height*0.4
            let x_scale = d3.scaleLinear().domain([-1,slots.length]).range([that.margin.left+strip, that.margin.left+width-strip])
            let lil_height = 0.1*that.actSize['SLOT']
            this.lil_height = lil_height

            // let control_y = 0.5*(path_y+storage_y)
            let control_y = 0.25*path_y + 0.75*storage_y
            let control_y1 = 0.5*(path_y+storage_y)
            let slots_stats = {}
            sorted_actions.filter(item=>item[0]=='WRITE').forEach(act=>{
                if(act[5] in slots_stats){
                    slots_stats[act[5]] += 1
                }else{
                    slots_stats[act[5]] = 1
                }
            })

            let max_content = Math.max(...Object.values(slots_stats))
            let x_gap = x_scale(1)-x_scale(0)
            let content_scale = d3.scaleLinear().domain([-1,max_content+5]).range([0,x_gap])
            console.log(slots_stats)
            //for write
            let slots_written = {}
            let tight_degree = 0.8
            that.pay_slot = []
            that.caller_slot = []
            sorted_actions.forEach((act,idx)=>{
                if(act[0]=='WRITE'){
                    if(act[5] in slots_written){
                        slots_written[act[5]] += 1
                    }else{
                        slots_written[act[5]] = 1
                    }
                    let path = `M${Action_Loc[idx].x} ${Action_Loc[idx].y+that.actSize['WRITE']} V${control_y1}`
                    let center_x = x_scale(parseInt(act[5]))+0.5*that.actSize['SLOT']
                    let slot_idx = slots_written[act[5]]
                    path += `C${Action_Loc[idx].x} ${control_y}, ${center_x} ${control_y} ${center_x} ${storage_y}`
                    // let line_gap = (0.5* that.actSize['SLOT']/(slots_stats[act[5]]+1) ) * slot_idx
                    // let line_gap = 0
                    // if(Action_Loc[idx].x >= center_x){
                    //     path += `C${Action_Loc[idx].x} ${control_y}, ${control_x} ${center_y+tight_degree*that.actSize['SLOT']+line_gap} ${storage_x} ${center_y+tight_degree*that.actSize['SLOT']+line_gap}
                    //      h${that.actSize['SLOT']+(slot_idx-1)*x_gap} Q${x_scale(slot_idx)} ${center_y+tight_degree*that.actSize['SLOT']+line_gap}, ${x_scale(slot_idx)} ${center_y+line_gap}`
                    // }else{
                    //     path += `C${control_x} ${Action_Loc[idx].y}, ${control_x} ${center_y-tight_degree*that.actSize['SLOT']+line_gap} ${storage_x} ${center_y-tight_degree*that.actSize['SLOT']+line_gap}
                    //     h${that.actSize['SLOT']+(slot_idx-1)*x_gap} Q${x_scale(slot_idx)} ${center_y-tight_degree*that.actSize['SLOT']+line_gap}, ${x_scale(slot_idx)} ${center_y+line_gap}`
                    // }
                    let line_color = that.actColor['LINE']
                    let write_content = act[6]
                    if(act[4]=='mapping'){
                        write_content = act[7]
                    }
                    if(write_content.includes('CALLER') | write_content.includes('CALLVALUE')){
                        line_color = that.actColor['WRITE']
                    }
                    storage_G.append('path').classed('interaction',true)
                        .attr('d',path).attr('fill','none').attr("stroke",line_color).attr("stroke-width",1)
                    // that.drawSlotContents(storage_G,x_scale(slots_written[parseInt(act[5])]),y_scale(parseInt(act[5])),0.5*(x_scale(1)-x_scale(0)),write_content)
                    if(write_content=='CALLER'){
                        that.caller_slot.push(act[5])
                    }
                }else if(act[0]=='PAY'&&Number.isInteger(act[4])){
                    let center_x = x_scale(parseInt(act[4]))+0.5*that.actSize['SLOT']
                    let path = `M${Action_Loc[idx].x} ${Action_Loc[idx].y+that.actSize['PAY']} V${control_y1} C${Action_Loc[idx].x} ${control_y}, ${center_x} ${control_y}, ${center_x} ${storage_y}`
                    storage_G.append('path').classed('interaction',true)
                        .attr('d',path).attr('fill','none').attr("stroke",that.actColor['PAY']).attr("stroke-width",1)
                    that.pay_slot.push(act[4])
                }
            })
            //draw the slot glyphs
            let critical_slots = [...that.caller_slot].filter(item=>[...that.pay_slot].includes(item))
            console.log(critical_slots,storage_y)
            slots.forEach(item=>{
                let check = critical_slots.includes(parseInt(item))
                that.drawSlots(storage_G,x_scale(parseInt(item)),storage_y,storage[item],lil_height,check)
                // storage_G.append('text')
                //         .attr('x',storage_x-3).attr('y',y_scale(parseInt(item))+that.actSize['SLOT']*0.5)
                //         .attr('text-anchor','end').attr('dominant-baseline','middle')
                //         .attr('font-family','Arial').attr('font-weight','bold')
                //         .attr('font-size',10)
                // .text(`#[${item}]`)
            })
        },
        drawStorage3(svg,width,height,path_x,storage_x,storage,sorted_actions,Action_Loc){
            //remove g
            d3.select('g.storage_G').remove()
            let that = this
            let storage_G = svg.append('g').classed("storage_G",true)
            // storage[5] = ['mapping']
            let slots = Object.keys(storage)
            let y_scale = d3.scaleLinear().domain([-1,slots.length]).range([that.margin.top+height/3, that.margin.top+height/1.5])
            let lil_height = 0.1*that.actSize['SLOT']
            this.lil_height = lil_height

            let control_x = width/2
            let slots_stats = {}
            sorted_actions.filter(item=>item[0]=='WRITE').forEach(act=>{
                if(act[5] in slots_stats){
                        slots_stats[act[5]] += 1
                    }else{
                        slots_stats[act[5]] = 1
                    }
            })

            let max_content = Math.max(...Object.values(slots_stats))
            let x_scale = d3.scaleLinear().domain([0.3,max_content+1]).range([storage_x+that.actSize['SLOT'],that.svgWidth])

            //for write
            let slots_written = {}
            let x_gap = x_scale(1)-x_scale(0)
            let y_gap = y_scale(1)-y_scale(0)
            let tight_degree = 0.8
            that.pay_slot = []
            that.caller_slot = []
            sorted_actions.forEach((act,idx)=>{
                if(act[0]=='WRITE'){
                    if(act[5] in slots_written){
                        slots_written[act[5]] += 1
                    }else{
                        slots_written[act[5]] = 1
                    }
                    let path = `M${Action_Loc[idx].x+that.actSize['WRITE']} ${Action_Loc[idx].y}`
                    let center_y = y_scale(parseInt(act[5]))+0.5*that.actSize['SLOT']
                    let slot_idx = slots_written[act[5]]
                    // let line_gap = (0.5* that.actSize['SLOT']/(slots_stats[act[5]]+1) ) * slot_idx
                    let line_gap = 0
                    if(Action_Loc[idx].y >= center_y){
                        path += `C${control_x} ${Action_Loc[idx].y}, ${control_x} ${center_y+tight_degree*that.actSize['SLOT']+line_gap} ${storage_x} ${center_y+tight_degree*that.actSize['SLOT']+line_gap}
                         h${that.actSize['SLOT']+(slot_idx-1)*x_gap} Q${x_scale(slot_idx)} ${center_y+tight_degree*that.actSize['SLOT']+line_gap}, ${x_scale(slot_idx)} ${center_y+line_gap}`
                    }else{
                        path += `C${control_x} ${Action_Loc[idx].y}, ${control_x} ${center_y-tight_degree*that.actSize['SLOT']+line_gap} ${storage_x} ${center_y-tight_degree*that.actSize['SLOT']+line_gap}
                        h${that.actSize['SLOT']+(slot_idx-1)*x_gap} Q${x_scale(slot_idx)} ${center_y-tight_degree*that.actSize['SLOT']+line_gap}, ${x_scale(slot_idx)} ${center_y+line_gap}`
                    }
                    let line_color = that.actColor['LINE']
                    let write_content = act[6]
                    if(act[4]=='mapping'){
                        write_content = act[7]
                    }
                    if(write_content.includes('CALLER') | write_content.includes('CALLVALUE')){
                        line_color = that.actColor['WRITE']
                    }
                    storage_G.append('path').classed('interaction',true)
                        .attr('d',path).attr('fill','none').attr("stroke",line_color).attr("stroke-width",1)
                    that.drawSlotContents(storage_G,x_scale(slots_written[parseInt(act[5])]),y_scale(parseInt(act[5])),0.5*(x_scale(1)-x_scale(0)),write_content)
                    if(write_content=='CALLER'){
                        that.caller_slot.push(act[5])
                    }
                }else if(act[0]=='PAY'&&Number.isInteger(act[4])){
                    let center_y = y_scale(parseInt(act[4]))+0.5*that.actSize['SLOT']
                    let path = `M${Action_Loc[idx].x+that.actSize['PAY']} ${Action_Loc[idx].y} C${control_x} ${Action_Loc[idx].y}, ${control_x} ${center_y}, ${storage_x} ${center_y}`
                    storage_G.append('path').classed('interaction',true)
                        .attr('d',path).attr('fill','none').attr("stroke",that.actColor['PAY']).attr("stroke-width",1)
                    that.pay_slot.push(act[4])
                }
            })
            console.log(that.caller_slot,that.pay_slot)
            //draw the slot glyphs
            let critical_slots = [...that.caller_slot].filter(item=>[...that.pay_slot].includes(item))
            console.log(critical_slots)
            slots.forEach(item=>{
                let check = critical_slots.includes(parseInt(item))
                that.drawSlots(storage_G,storage_x,y_scale(parseInt(item)),storage[item],lil_height,check)
                storage_G.append('text')
                        .attr('x',storage_x-3).attr('y',y_scale(parseInt(item))+that.actSize['SLOT']*0.5)
                        .attr('text-anchor','end').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',10)
                .text(`#[${item}]`)
            })

        },
        drawSlotContents(svg,x,y,max_size,content){
            max_size = Math.min(max_size,0.5*this.actSize['SLOT'])
            let r = 0.9*max_size
            let cy = y+0.5*this.actSize['SLOT']
            svg.append('circle')
                    .attr('cx',x).attr('cy',cy).attr('r',0.6*r).attr('fill',this.actColor['STORAGE'])
            if(content.includes('CALLER')){
                svg.append('circle')
                    .attr('cx',x).attr('cy',cy).attr('r',r).attr('fill',this.actColor['STORAGE'])
                let icon_G = svg.append('g').classed('caller',true)
                icon_G.append('circle')
                        .attr('cx',x).attr('cy',cy-0.45*r).attr('r',0.3*r).attr('fill','black')
                icon_G.append('rect')
                        .attr('x',x-0.8*r).attr('y',cy-0.1*r).attr('width',1.6*r).attr('height',0.3*r).attr('fill','black')
                icon_G.append('rect')
                        .attr('x',x-0.3*r).attr('y',cy+0.2*r).attr('width',0.6*r).attr('height',0.5*r).attr('fill','black')
                if(content=='CALLER'){
                    svg.append('circle')
                    .attr('cx',x).attr('cy',cy).attr('r',r).attr('fill','none').attr('stroke','black').attr('stroke-width',1.5)
                }
            }else if(content.includes('CALLVALUE')){
                svg.append('circle')
                    .attr('cx',x).attr('cy',cy).attr('r',r).attr('fill',this.actColor['STORAGE'])
                let icon_G = svg.append('g').classed('callvalue',true)
                icon_G.append('text')
                        .attr('x',x).attr('y',cy+1).attr('fill','black')
                        .attr('text-anchor','middle').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',r*1.5)
                        .text('$')

                if(content=='CALLVALUE'){
                    svg.append('circle')
                    .attr('cx',x).attr('cy',cy).attr('r',r).attr('fill','none').attr('stroke','black').attr('stroke-width',1.5)
                }
            }else{
                svg.append('circle')
                    .attr('cx',x).attr('cy',cy).attr('r',0.7*r).attr('fill',this.actColor['STORAGE'])
            }
        },
        drawSlots(svg,x,y,slot_data,lil_height,check){
            console.log(x,y,slot_data,lil_height,check)
            let that = this
            let width = that.actSize['SLOT']
            let slot_G = svg.append('g').classed('storage',true)
            let highlight_color = 'black'

            slot_G.append('rect')
                .attr('x',x).attr('y',y).attr('width',width).attr('height',width)
                .attr('fill',that.actColor['STORAGE']).attr('stroke',check?highlight_color:that.actColor['LINE']).attr('stroke-width',lil_height)
            if(slot_data[0]=='array'){
                slot_G.append('rect')
                    .attr('x',x).attr('y',y+width*0.25-0.5*lil_height).attr('width',width).attr('height',lil_height)
                    .attr('fill',check?highlight_color:that.actColor['LINE'])
                slot_G.append('rect')
                    .attr('x',x).attr('y',y+width/2-0.5*lil_height).attr('width',width).attr('height',lil_height)
                    .attr('fill',check?highlight_color:that.actColor['LINE'])
                slot_G.append('rect')
                    .attr('x',x).attr('y',y+width*0.75-0.5*lil_height).attr('width',width).attr('height',lil_height)
                    .attr('fill',check?highlight_color:that.actColor['LINE'])
            }else if(slot_data[0]=='mapping'){
                let path1 = `M${x+1.5*lil_height} ${y} h${lil_height} l${lil_height} ${width/2} l${-lil_height} ${width/2} h${-lil_height} l${lil_height} ${-width/2}`
                let path2 = `M${x+4*lil_height} ${y} h${lil_height} l${lil_height} ${width/2} l${-lil_height} ${width/2} h${-lil_height} l${lil_height} ${-width/2}`
                let path3 = `M${x+6.5*lil_height} ${y} h${lil_height} l${lil_height} ${width/2} l${-lil_height} ${width/2} h${-lil_height} l${lil_height} ${-width/2}`
                slot_G.append('path')
                        .attr('d',path1).attr('fill',check?highlight_color:that.actColor['LINE'])
                slot_G.append('path')
                        .attr('d',path2).attr('fill',check?highlight_color:that.actColor['LINE'])
                slot_G.append('path')
                        .attr('d',path3).attr('fill',check?highlight_color:that.actColor['LINE'])
            }
        },
        // actions glyphs
        drawGlyphs(svg,cx,cy,act){
            let that = this
            let glyph_G = svg.append('g').classed(`${act[0]}`,true)
            if(act[act.length-1]=='callback' | act[act.length-1]=='update'){
                glyph_G.append('circle').classed(`${act[0]}`,true)
                    .attr('cx',cx).attr('cy',cy).attr('r',that.actSize[act[0]]+that.actSize['STROKE']).attr('fill','white')
                    .attr('stroke',that.actColor[act[0]]).attr('stroke-width',that.actSize['STROKE'])
            }
            glyph_G.append('circle').classed(`${act[0]}`,true)
                    .attr('cx',cx).attr('cy',cy).attr('r',that.actSize[act[0]]).attr('fill',that.actColor[act[0]])
            glyph_G.append('text').classed(`${act[0]}`,true)
                    .attr('x',cx).attr('y',cy+1)
                    .attr('text-anchor','middle').attr('dominant-baseline','middle')
                    .attr('font-family','Arial').attr('font-weight','bold')
                    .attr('font-size',that.actSize['TEXT']).attr('fill','white')
                    .text(`${act[0].slice(0,1)}`)
            glyph_G.on("mouseover",function(_event){
                    that.hover_act(_event,act)
                }).on("mouseout",function(_event){
                    that.out_act()
                })

        },
        //draw spiral
        ArchimedeanSpiral(a,b,step,start_y,start_x,len){

            let center_y = start_y
            let center_x = start_x +  (a + b*6*Math.PI)
            //round 1 
            let pathData1 = `M${start_x} ${start_y}`
            for(let theta = 6*Math.PI;theta>=4*Math.PI;theta-=step){ 
                let r = a + b * theta;
                let x = center_x - r * Math.cos(theta)
                let y = center_y + r * Math.sin(theta)
                pathData1 += `L ${x} ${y}`;
            }
            let pathData2 = `M${center_x - (a + b*4*Math.PI)} ${center_y}`
            for(let theta = 4*Math.PI;theta>=2*Math.PI;theta-=step){
                let r = a + b * theta;
                let x = center_x - r * Math.cos(theta)
                let y = center_y + r * Math.sin(theta)
                pathData2 += `L ${x} ${y}`;
            }

            let round1 = []
            for(let i=1;i<=len;i+=1){
                let gap = 2 * Math.PI / (len+1)
                let theta = 6*Math.PI - gap*i
                if(len%2 ==1){theta = 6*Math.PI - gap*(i-0.25)}
                let r = a + b * theta;
                let x = center_x - r * Math.cos(theta)
                let y = center_y + r * Math.sin(theta)
                round1.push([x,y])
            }

            let round2 = []
            for(let j=1;j<=len;j+=1){
                let gap = 2 * Math.PI / (len+1)
                let theta = 4*Math.PI - gap*j
                if(len%2 ==1){theta = 4*Math.PI - gap*(j-0.25)}
                let r = a + b * theta;
                let x = center_x - r * Math.cos(theta)
                let y = center_y + r * Math.sin(theta)
                round2.push([x,y])
            }
            return [pathData1,pathData2,[start_x,center_x + ( a + b * Math.PI * 5),center_x-(a+b*Math.PI*2),center_x+(a+b*Math.PI*3)],[round1,round2]]
        },

        // hover the action show the details
        hover_act(_event,d){
            let res = d3.pointer(_event)
            d3.select('div.tooltip_action').select('p').remove()
            let text = [`${d[0]}`]
            if(d[0]=='READ'){
                text.push(`${d[4]}`)
            }else if(d[0]=='WRITE'){ 
                if(d[4]=='mapping'){
                    text.push(`#${d[5]}-${d[6]} (${d[4]})`)
                    text.push(`${d[7]}`)
                }else{
                    text[0] = `${d[0]}  ->  SLOT #${d[5]}`
                    text.push(`${d[6]}`)
                }
            }else if(d[0]=='CONS'){
                text[0] = `${d[0]}  (${d[4]})`
                text.push(`${d[5]}`)
            }else if(d[0]=='PAY'){
                if(d[4]=='CALLER'){
                    text.push(`PAY BACK TO: ${d[4]}`)
                }else if(String(d[4]).includes('CALLDATA')){
                    text.push(`PAY TO OUTSIDE`)
                }else{
                    text.push(`Get Receiver from #${d[4]}`)
                }
                text.push(`Value: ${d[5]}`)
            }
            d3.select('div.tooltip_action').append("p").html(text.join("<br>"))
            d3.select('div.tooltip_action').attr('style',`transform:translate(${parseInt(res[0])+20}px,${parseInt(res[1])-30}px);visibility:visible`)
        },
        // mouse out from the action
        out_act(){
            d3.select('div.tooltip_action').attr('style',`visibility:hidden`)
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
        // drawActions2(svg,width,height,path_x,y_scale,o_path,data,sorted_actions,snap){
        //     //remove g
        //     d3.select('g.act_G').remove()
        //     let that = this
        //     let act_G = svg.append('g').classed("act_G",true)

        //     //deal with the data ===========================================================================================
        //     let loop_point = data['loop'].sort(d=>o_path.indexOf(d)).reverse()

        //     console.log(loop_point,o_path)
        //     if(loop_point.length>0){// if there is a loop
        //         // segment the actions
        //         let flag = 0
        //         let finish = false
        //         let p_index = 0
        //         let start_idx = 0
        //         let none_loop_segments = []
        //         let loop_segments = []
        //         let first_ins_idx = 0

        //         sorted_actions.forEach((item,idx)=>{
        //             if(flag==0 && item[1] == loop_point[p_index]){ //first reach loop point
        //                 flag = 1
        //                 let seg = sorted_actions.slice(start_idx,idx)
        //                 none_loop_segments.push(['none',start_idx,idx, seg.length, seg])
        //                 start_idx = idx
        //                 first_ins_idx = item[3]
        //             }else if(flag==1 && item[1] != loop_point[p_index]){ //judgement of whether pass the loop point
        //                 finish = true
        //             }else if(finish == false && item[1]==loop_point[p_index] && item[3]==first_ins_idx){//if loop point is linked together
        //                 let seg = sorted_actions.slice(start_idx,idx)
        //                 loop_segments.push([p_index,start_idx, idx, seg.length, seg])
        //                 start_idx = idx
        //                 finish = true
        //             }else if(finish==true && flag==1 && item[1] == loop_point[p_index]){// segment of the round  2 of loop
        //                 let seg = sorted_actions.slice(start_idx,idx)
        //                 loop_segments.push([p_index,start_idx, idx, seg.length, seg])
        //                 flag = 2
        //                 finish = false
        //                 start_idx = idx
        //             }else if(flag==2 && finish==false && item[1] != loop_point[p_index]){ //judgement of whetehr pass the second loop point
        //                 finish = true
        //             }else if(flag==2 && finish==true && item[1] == loop_point[p_index]){// 
        //                 let seg = sorted_actions.slice(start_idx,idx)
        //                 loop_segments.push([p_index,start_idx, idx, seg.length, seg])
        //                 flag = 0
        //                 finish = false
        //                 start_idx = idx
        //                 p_index += 1
        //             }
        //         })
        //         let seg = sorted_actions.slice(start_idx)
        //         none_loop_segments.push(['none',start_idx,sorted_actions.length, seg.length, seg])
        //         console.log(none_loop_segments,loop_segments)
        //         //end of segments=====================================================================================================
        //         //caculate height
        //         let y_scale = {}
        //         let cursor = 0
        //         let cursor_height = 0
        //         let SinTheta = 0.4
        //         let CosTheta = 1
        //         // sin(Theta) * x * 3 = the whole height of loop
        //         let key_points = []

        //         //caculate height
        //         none_loop_segments.forEach((seg,seg_idx)=>{
        //             let key_point = []
        //             if(seg_idx==0){ //before loop
        //                 seg[4].forEach((act)=>{
        //                     y_scale[cursor] = cursor_height
        //                     cursor_height += 2*(that.actSize[act[0]]+that.actSize['STROKE'] + that.actSize['GAP'])
        //                     cursor += 1
        //                 })
        //             }else{
        //                 loop_segments.slice((seg_idx-1)*2,(seg_idx-1)*2+2).forEach((loop_seg,l_idx)=>{
        //                     let loop_height = (loop_seg[3]) * 2 * that.actSize['PAY']
        //                     if(l_idx==0){
        //                         key_point.push(["start1",seg_idx,cursor_height])
        //                         cursor_height += loop_height * SinTheta * 0.4
        //                         key_point.push(["start2",seg_idx,cursor_height])
        //                     }
        //                     let loop_len = loop_seg[4].length
        //                     if(loop_len>1){
        //                         loop_seg[4].forEach((act,act_idx)=>{
        //                             y_scale[cursor] = cursor_height
        //                             cursor_height += SinTheta * 2 *(that.actSize[act[0]]+that.actSize['STROKE'] + that.actSize['GAP']) 
        //                             cursor_height -= 2*that.actSize[act[0]]*(0.5*loop_len-act_idx)/loop_len
        //                             cursor += 1
        //                         })                                
        //                     }else{
        //                         let act = loop_seg[4][0]
        //                         y_scale[cursor] = cursor_height
        //                         cursor_height +=  1.5*(that.actSize[act[0]]+that.actSize['STROKE'] + that.actSize['GAP']) 
        //                         cursor += 1
        //                     }

        //                     key_point.push([`round${l_idx}`,seg_idx,cursor_height])
        //                     if(l_idx==1){
        //                         cursor_height += loop_height * SinTheta * 0.4
        //                         key_point.push(["end",seg_idx,cursor_height])                        
        //                         key_point.push(loop_height)
        //                     }                    
        //                 })                 
        //                 seg[4].forEach((act)=>{
        //                     y_scale[cursor] = cursor_height
        //                     cursor_height += 2*(that.actSize[act[0]]+that.actSize['STROKE'] + that.actSize['GAP'])
        //                     cursor += 1
        //                 })        
        //                 key_points.push(key_point)            
        //             }

        //         })
        //         let y_mapping = d3.scaleLinear().domain([0,cursor_height]).range([that.margin.top,that.margin.top+height])

        //         //draw the line
        //         let line_G = act_G.append('g').classed('line',true)
        //         // let line_d = `M${path_x} ${that.margin.top}`
        //         let dots = [{x: path_x, y: that.margin.top}]
        //         key_points.forEach(item=>{
        //             let h = y_mapping(item[5])
        //             // console.log(item) //[[name,idx,height],[],[],[],[height]]
        //             // line_d += `L${path_x} ${y_mapping(item[0][2])} L${path_x-h*CosTheta*0.25} ${y_mapping(item[1][2])}
        //             //            L${path_x+h*CosTheta*0.5} ${y_mapping(item[2][2])} L${path_x-h*CosTheta*0.5} ${y_mapping(item[2][2])}
        //             //            L${path_x+h*CosTheta*0.25} ${y_mapping(item[3][2])} L${path_x} ${y_mapping(item[4][2])}`
        //             dots.push({x: path_x,y: y_mapping(item[0][2])})
        //             dots.push({x: path_x-h*CosTheta*0.25, y: y_mapping(item[1][2])})
        //             dots.push({x: path_x+h*CosTheta*0.5, y: y_mapping(item[2][2])})
        //             dots.push({x: path_x-h*CosTheta*0.5, y: y_mapping(item[2][2])})
        //             dots.push({x: path_x+h*CosTheta*0.25, y: y_mapping(item[3][2])})
        //             dots.push({x: path_x, y: y_mapping(item[4][2])})
        //         })
        //         // line_d += `L${path_x} ${that.margin.top+height}`
        //         dots.push({x: path_x, y: that.margin.top+height})
        //         // let curve = d3.curveCardinal.tension(0.5)
        //         let curve = d3.curveBumpY
        //         let lineGenerator = d3.line().x(d=>d.x).y(d=>d.y).curve(curve)
        //         let path_d = lineGenerator(dots)

        //         let s_path = snap.path(path_d)

        //         line_G.append('path').attr('d',path_d).attr('fill','none').attr('stroke',that.actColor['LINE'])
        //         //recaculate the y of loop actions
        //         let round_check = false
        //         loop_segments.forEach(item=>{
        //             let idx = item[0]
        //             let start = item[1]
        //             let end = item[2]
        //             let actions = item[4]
        //             console.log(start,end,idx,actions,key_points[idx])
        //             if(!round_check){//round 1
        //                 let start2 = key_points[idx][1][2]
        //                 console.log(start2)

        //             }
        //         })
  
        //         sorted_actions.forEach((act,idx)=>{
        //             let y = y_mapping(y_scale[idx]+that.actSize[act[0]])
        //             let y_path = snap.path(`M0 ${y} L${width} ${y}`)
        //             let intersections = Snap.path.intersection(s_path,y_path)
        //             act_G.append('circle').classed('action',true)
        //                 .attr("cx",intersections[0]['x']).attr("cy",y)
        //                 .attr('r',that.actSize[act[0]])
        //                     .attr("fill",that.actColor[act[0]])
        //                     .attr("stroke",that.actColor['STROKE'])
        //                     .attr('stroke-width',that.actSize['STROKE'])
        //                         .on("mouseover",function(_event){
        //                         that.hover_act(_event,act)
        //                         }).on("mouseout",function(_event){
        //                             that.out_act()
        //                         })
        //             if(act[act.length-1]=='callback' | act[act.length-1]=='update' ){
        //                 act_G.append('circle')
        //                     .attr('cx',intersections[0]['x'])
        //                         .attr('cy',y)
        //                         .attr('r',that.actSize[act[0]]-2*that.actSize['STROKE'])
        //                         .attr("fill",'none')
        //                         .attr("stroke",that.actColor['STROKE'])
        //                         .attr('stroke-width',that.actSize['STROKE'])
        //             }
        //         })
        //     }else{ //no loop
        //         act_G.append('line').classed('act',true)
        //             .attr("x1",path_x).attr("y1",that.margin.top)
        //             .attr("x2",path_x).attr("y2",that.margin.top+height)
        //             .attr("stroke",that.actColor['LINE']).attr("stroke-width",that.actSize['LINE'])
        //         sorted_actions.forEach((d,i)=>{
        //             act_G.append('circle')
        //                 .classed('act',true)
        //                     .attr('cx',path_x)
        //                     .attr('cy',y_scale(i))
        //                     .attr('r',that.actSize[d[0]])
        //                     .attr("fill",that.actColor[d[0]])
        //                     .attr("stroke",that.actColor['STROKE'])
        //                     .attr('stroke-width',that.actSize['STROKE'])
        //                         .on("mouseover",function(_event){
        //                         that.hover_act(_event,d)
        //                         }).on("mouseout",function(_event){
        //                             that.out_act()
        //                         })
        //             if(d[d.length-1]=='callback' | d[d.length-1]=='update' ){
        //                 act_G.append('circle')
        //                     .attr('cx',path_x)
        //                         .attr('cy',y_scale(i))
        //                         .attr('r',that.actSize[d[0]]-2*that.actSize['STROKE'])
        //                         .attr("fill",'none')
        //                         .attr("stroke",that.actColor['STROKE'])
        //                         .attr('stroke-width',that.actSize['STROKE'])
        //             }
        //         })
        //     }
        // },
        // drawActions(svg,width,height,path_x,y_scale,data,sorted_actions){
        //     //remove g
        //     d3.select('g.act_G').remove()

        //     //initial data
        //     let that = this
        //     let act_G = svg.append('g').classed("act_G",true)

        //     act_G.append('line').classed('act',true)
        //         .attr("x1",path_x).attr("y1",that.margin.top)
        //         .attr("x2",path_x).attr("y2",that.margin.top+height)
        //         .attr("stroke",that.actColor['LINE']).attr("stroke-width",that.actSize['LINE'])
            
        //     sorted_actions.forEach((d,i)=>{
        //         act_G.append('circle')
        //             .classed('act',true)
        //                 .attr('cx',path_x)
        //                 .attr('cy',y_scale(i))
        //                 .attr('r',that.actSize[d[0]])
        //                 .attr("fill",that.actColor[d[0]])
        //                 .attr("stroke",that.actColor['STROKE'])
        //                 .attr('stroke-width',that.actSize['STROKE'])
        //                     .on("mouseover",function(_event){
        //                     that.hover_act(_event,d)
        //                     }).on("mouseout",function(_event){
        //                         that.out_act()
        //                     })
        //         if(d[d.length-1]=='callback' | d[d.length-1]=='update' ){
        //             act_G.append('circle')
        //                 .attr('cx',path_x)
        //                     .attr('cy',y_scale(i))
        //                     .attr('r',that.actSize[d[0]]-2*that.actSize['STROKE'])
        //                     .attr("fill",'none')
        //                     .attr("stroke",that.actColor['STROKE'])
        //                     .attr('stroke-width',that.actSize['STROKE'])
        //         }
        //     })

        // },

        // drawStorage(svg,width,height,storage_x,path_x,y_scale,storage,sorted_actions){
        //     //remove g
        //     d3.select('g.storage_G').remove()
        //     d3.select('g.interaction_G').remove()

        //     //initial data
        //     let that = this
        //     let storage_G = svg.append('g').classed("storage_G",true)
        //     let interaction_G = svg.append('g').classed("interaction_G",true)
        //     console.log(storage)
        //     let slots = Object.keys(storage)
        //     let highBoarder = that.margin.top+height/2-((slots.length+1)*that.actSize['SLOT']*1.5)
        //     let lowBoarder = highBoarder + ((slots.length+1)*that.actSize['SLOT']*1.5)
        //     let s_scale = d3.scaleLinear().domain([-1,slots.length+1]).range([highBoarder,lowBoarder])

        //     //draw the interactions
        //     sorted_actions.forEach((act,i)=>{
        //         if(act[0]=='WRITE'){
        //             let path = `M${path_x+that.actSize['WRITE']} ${y_scale(i)} C${0.5*(storage_x+path_x)} ${y_scale(i)}, 
        //             ${0.5*(storage_x+path_x)} ${s_scale(act[5])+0.5*that.actSize['SLOT']}, ${storage_x} ${s_scale(act[5])+0.5*that.actSize['SLOT']}`
        //             interaction_G.append('path').classed('interaction',true)
        //                 .attr('d',path).attr('fill','none').attr("stroke",that.actColor['WRITE']).attr("stroke-width",2)
        //         }
        //         if(act[0]=='PAY'&&Number.isInteger(act[4])){
        //             let path = `M${path_x+that.actSize['PAY']} ${y_scale(i)} C${0.5*(storage_x+path_x)} ${y_scale(i)}, 
        //             ${0.5*(storage_x+path_x)} ${s_scale(act[4])+0.5*that.actSize['SLOT']}, ${storage_x} ${s_scale(act[4])+0.5*that.actSize['SLOT']}`
        //             interaction_G.append('path').classed('interaction',true)
        //                 .attr('d',path).attr('fill','none').attr("stroke",that.actColor['PAY']).attr("stroke-width",2)
        //         }
        //     })

        //     //draw storage slot
        //     slots.forEach(d=>{
        //         if(storage[d][0]=='variable'){
        //             storage_G.append('g').classed("variable",true).classed("storage",true)
        //                 .append('rect')
        //                     .attr('x',storage_x).attr("y",s_scale(d))
        //                     .attr('width',that.actSize['SLOT']).attr('height',that.actSize['SLOT'])
        //                     .attr('fill',that.actColor['STORAGE'])
        //         }else if(storage[d][0]=='array'){
        //             let array_G = storage_G.append('g').classed('array',true).classed("storage",true)
        //             let array_content = [0,1,2]
        //             array_G.selectAll('rect.array')
        //                 .data(array_content).join('rect').classed('array',true)
        //                     .attr('x',d=>storage_x+d*that.actSize['SLOT']*1.1).attr("y",s_scale(d))
        //                     .attr('width',that.actSize['SLOT']).attr('height',that.actSize['SLOT'])
        //                     .attr('fill',that.actColor['STORAGE'])
        //         }else if(storage[d][0]=='mapping'){
        //             let mapping_G = storage_G.append('g').classed('mapping',true).classed("storage",true)
        //             mapping_G.append('rect').classed("mapping",true).classed("storage",true)
        //                     .attr('x',storage_x).attr("y",s_scale(d))
        //                     .attr('width',that.actSize['SLOT']).attr('height',that.actSize['SLOT'])
        //                     .attr('fill',that.actColor['STORAGE'])
        //             mapping_G.append('rect').classed("mapping",true).classed("storage",true)
        //                     .attr('x',storage_x+that.actSize['SLOT']*2).attr("y",s_scale(d))
        //                     .attr('width',that.actSize['SLOT']).attr('height',that.actSize['SLOT'])
        //                     .attr('fill',that.actColor['STORAGE'])
        //             let arrow = `M${storage_x+that.actSize['SLOT']} ${s_scale(d)+0.5*that.actSize['SLOT']} L${storage_x+that.actSize['SLOT']*2} ${s_scale(d)+0.5*that.actSize['SLOT']}`
        //             mapping_G.append('path').classed("mapping",true).classed("storage",true)
        //                     .attr('d',arrow).attr("stroke",that.actColor['STORAGE']).attr("fill",'none')
        //                     .attr("stroke-width",3)//'M10 50 L90 50 L70 30 L90 50 L70 70'
        //         }
        //         storage_G.append("text").classed("storage",true)
        //             .attr("x",storage_x+0.1*that.actSize['SLOT']).attr("y",s_scale(d)+0.7*that.actSize['SLOT']).attr('text-anchor','start')
        //             .attr('font-size',13).attr('fill',that.actColor['SLOT'])
        //             .text(`#${d} ${storage[d][0]}`)
        //     })
        // },
        // //draw loop
        // drawLoop(svg,width,height,loop_x,path_x,y_scale,InLoop){
        //     console.log('loople',InLoop)
        //     //remove g
        //     d3.select('g.loop_G').remove()

        //     let that = this
        //     let loop_G = svg.append("g").classed('loop_G',true)
        //     let start = 0 
        //     let segment_len = 0
        //     let keys = Object.keys(InLoop)
        //     let loop_scale_x = d3.scaleLinear().domain([-1,keys.length]).range([0,2*loop_x])
        //     //draw the circle
        //     keys.forEach((key,idx)=>{
        //         let sub_loop = loop_G.append('g').classed('sub-loop',true)
        //         start = InLoop[key]['start'] - segment_len
        //         //draw the line
        //         let path_d = `M${path_x} ${y_scale(start-1)} Q${0.5*(loop_scale_x(idx)+path_x)} ${y_scale(start)} ${loop_scale_x(idx)} ${y_scale(start)} 
        //         L${loop_scale_x(idx)} ${y_scale(start+InLoop[key]['segment'].length-1)} L${path_x} ${y_scale(start)}`
        //         sub_loop.append("path").classed('loop',true)
        //             .attr('d',path_d).attr('fill','none').attr('stroke',that.actColor['LINE'])
        //             .attr('stroke-width',that.actSize['LINE']-1)
        //         //draw the circle
        //         InLoop[key]['segment'].forEach((d,i)=>{
        //             sub_loop.append("circle").classed('loop',true)
        //                     .attr('cx',loop_scale_x(idx))
        //                     .attr('cy',y_scale(i+start))
        //                     .attr('r',that.actSize[d[0]])
        //                     .attr("fill",that.actColor[d[0]])
        //                     .attr("stroke",that.actColor['STROKE'])
        //                     .attr('stroke-width',that.actSize['STROKE'])
        //                         .on("mouseover",function(_event){
        //                         that.hover_act(_event,d)
        //                         }).on("mouseout",function(_event){
        //                             that.out_act()
        //                         })
        //             if(d[d.length-1]=='callback' | d[d.length-1]=='update' ){
        //                 loop_G.append('circle')
        //                     .attr('cx',loop_scale_x(idx))
        //                         .attr('cy',y_scale(i+start))
        //                         .attr('r',that.actSize[d[0]]-2*that.actSize['STROKE'])
        //                         .attr("fill",'none')
        //                         .attr("stroke",that.actColor['STROKE'])
        //                         .attr('stroke-width',that.actSize['STROKE'])
        //             }
        //         })
        //         segment_len += InLoop[key]['segment'].length
        //     })


        // },
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
.selection {
    fill: #adb5bd;
    opacity: 1;
}
.handle {
    fill: #775039;
    width:2px;
}
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
.tooltip_action {
    position: absolute;
    visibility: hidden;
    margin-left: 0px;
    margin-top: 0px;
    text-anchor: start;
    background-color: black;
    color: white;
    border-radius: 5px;
    font-size: 10px;
    width: auto;
    max-width: 250px;
    word-wrap: break-word;
    height: auto;
    padding-left: 8px;
    padding-right: 8px;
    text-align: left;
}
</style>

