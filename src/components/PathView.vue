<template>
    <div id="svg-container" style="height:100%;width:100%;background:white;" ref="container" class="display-flex">
        <div class="view_title" style="margin-left:-15px;margin-top:-11px;height:20px;width:100%;
        background:#e9ecef;position: absolute;font: 1.2em sans-serif;text-align:center;font-weight: 600;border-radius: 5px;">
            Path Overview
        </div> 
        <svg class="Path" :height="this.svgHeight" :width="this.svgWidth" style="position:absolute">
        </svg>     
        <div class="tooltip_path" style="position:absolute;z-index:2">
               <p>111</p>
        </div>  
    </div>
</template>

<script>
import {NInputNumber,NButton,NDatePicker,NSwitch,NSelect,NCard} from 'naive-ui'
import * as d3 from "d3"

// import Actions from "../assets/Daily12.json"

export default {
    name:"Path View",
    components:{ NInputNumber,NButton ,NDatePicker,NSwitch,NSelect,NCard},
    props:['actColor','actions','update_selected_data'],
    data(){
        return {
            svgHeight:'0',
            svgWidth:'0',
            margin:{top:20,bottom:0,left:0,right:5},
            actSize:{
                'READ':3,
                'WRITE':4,
                'PAY':5,
                'CONS':3,
                'LINE':1,
                'STROKE':1.5,
                'SLOT': 20
            },
            actSizeD:{
                'READ':6,
                'WRITE':6,
                'PAY':6,
                'CONS':6,
                'LINE':2,
                'STROKE':1.5,
                'SLOT': 15,
                'GAP':1,
                'TEXT':8,
            },
            label_idx:{
                'WriteCaller':0,
                'Pay':1,
                'PayInvestor':3,
                'Loop':2,
            },
            Paths_Data:[],
            groups:{},
            r:0,
            select_actions:[],
            selected_group_paths:[],
            selected_group_loc:[],
            right_start:0,
            group_brush:{},
            Action_Loc:{},
            storage:{},
            caller_slot:[],
            pay_slot:[],
            lil_height:0,
        }
    },
    computed:{
    },
    watch:{
        selected_group_paths:function(newVal, oldVal){
            if(newVal != oldVal){
                this.drawInit()
                console.log(newVal)
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
            //initial
            let that = this
            let data = that.actions //raw data 


            // init svg
            let svg = d3.select("svg.Path")
                    .attr("width",that.svgWidth)
                    .attr("height",that.svgHeight)
            let width = that.svgWidth - that.margin.left - that.margin.right
            let height = that.svgHeight - that.margin.top - that.margin.bottom

            let filter_width = width/5
            let filter_height = height/2.5
            this.drawFilter2(svg,that.margin.left,that.margin.left+filter_width,filter_height,filter_width)
            // this.drawPaths(svg,data,that,width,height,that.margin.top+filter_height)
            console.log(that.selected_group_loc)
            this.right_start = that.margin.left+filter_width
            d3.select('g.brush_G').remove()
            d3.selectAll('svg.sub-svg').remove()
            if(this.selected_group_paths.length>0){
                this.drawInsertView()
                this.drawBrushBar(svg)
            }
        },
        drawBrushBar(svg){
            let that = this

            let x = that.right_start
            let brush_w = 7
            let selected_group_paths = that.selected_group_paths
            let selected_group_loc = that.selected_group_loc
            selected_group_loc.sort((a,b)=>{
                return a[1]-b[1]
            })

            let brush_G = svg.append('g').classed('brush_G',true)
            selected_group_loc.forEach((item,unfold_idx)=>{
                let group_G = brush_G.append('g').classed('group_G',true)

                let group_name = item[0]
                let path_list = selected_group_paths.filter(l=>l[0]==group_name)[0][1]
                let path_len = path_list.length
                let y1 = item[1]
                let y2 = item[2]
                let svg_height = y2 - y1

                let y_scale = d3.scaleLinear().domain([0,path_len]).range([y1,y2-10])
                let y_gap = y_scale(1)-y_scale(0)
                let brush_scale = d3.scaleQuantile().domain([y1,y2-10]).range([...Array(path_len+1).keys()].map((num) => num))

                path_list.forEach((pid,p_idx)=>{
                    group_G.append('rect')
                        .attr('x',x).attr('y',y_scale(p_idx+0.05))
                        .attr('width',brush_w).attr('height',y_gap*0.9)
                        .attr('rx',2)
                        .attr('fill','#dfe4ea')
                        .attr('stroke','black')
                })
                let brushended = (_event)=>{
                    let selection = _event.selection
                    let target = brush_scale(selection[0])
                    if(y_scale(target)!=selection[0]){
                        group_G.call(brush.move,[y_scale(target),y_scale(target+1)])
                        that.group_brush[group_name] = target
                    }

                }
                let brushing = (_event)=>{
                    let selection = _event.selection
                    let trans_Y = ( (selection[0]-y1) / y_gap ) * svg_height
                    let p = /,/g
                    let obj_svg = d3.select(`svg.G${group_name.replace(p,'')}`).select('g.insert_G')
                    let origin_translate = obj_svg.attr('transform')
                    let parse_transform = /[-+]?\d+(\.\d+)?/g
                    let match_res = origin_translate.match(parse_transform)
                    let origin_x = parseFloat(match_res[0])
                    let origin_y = parseFloat(match_res[1])
                    
                    obj_svg.attr('transform',`translate(${0},${-trans_Y})`)
                }
                let brush = d3.brushY()
                                // .extent([[x,y1],[x+brush_w,y1+y_gap*0.9]])
                                .extent([[x-5,y_scale(0)],[x+brush_w+5,y2-10]])
                                .on('end',brushended)
                                .on('brush',brushing)
                if(group_name in that.group_brush){
                    let target = that.group_brush[group_name]
                    group_G.call(brush)
                        .call(brush.move,[y_scale(target),y_scale(target+1)])
                }else{
                    group_G.call(brush)
                        .call(brush.move,[y_scale(0),y_scale(1)])
                }

            })

        },
        drawInsertView(){

            let that = this

            let Paths_Data = that.Paths_Data
            let selected_group_paths = that.selected_group_paths
            let selected_group_loc = that.selected_group_loc
            console.log(Paths_Data)
            selected_group_loc.sort((a,b)=>{
                return a[1]-b[1]
            })
            selected_group_loc.forEach((item,unfold_idx)=>{
                let group_name = item[0]
                let path_list = selected_group_paths.filter(l=>l[0]==group_name)[0][1]
                let y1 = item[1]
                let y2 = item[2]
                let svg_height = y2 - y1
                let svg_width = that.svgWidth-that.right_start-that.margin.left

                let translate_x = that.right_start +10
                let translate_y = y1-unfold_idx*svg_height
                let start_y = y1
                let p = /,/g
                let sub_svg = d3.select('div#svg-container')
                                    .append('svg').classed(`G${group_name.replace(p,'')}`,true).classed('sub-svg',true)
                                    .attr('width',svg_width).attr('height',svg_height)
                                    .attr("position",'absolute')
                                    .attr('z-index',0)
                                    .attr('viewBox',`${0} ${0} ${that.svgWidth-that.right_start} ${svg_height}`)
                                    .attr('transform',`translate(${translate_x},${translate_y})`)
                                    .attr('fill','red')

                let insert_G = sub_svg.append('g').classed('insert_G',true)

                let y_scale = d3.scaleLinear().domain([0,1]).range([0,svg_height])

                console.log(group_name,path_list);
                path_list.forEach((pid,p_idx)=>{
                    let data = Paths_Data[pid]
                    console.log(data)
                    //draw the view here
                    let y1 = y_scale(p_idx)
                    let y2 = y_scale(p_idx+1)

                    //background
                    let back_gap = 4
                    insert_G.append('rect')
                        .attr('x',0).attr('y',y1+back_gap)
                        .attr('width',svg_width).attr('height',svg_height-back_gap)
                        .attr('fill','#ecf0f1')
                        .attr('opacity',0.5)
                        .attr('rx',back_gap).attr('ry',back_gap)
                    //draw single path
                    that.drawActionSeq(insert_G,pid,data,y1,y2,svg_width)

                    //draw the storage
                    let store_G = insert_G.append('g').classed(`store_G${pid}`,true)
                    that.drawStorage(store_G,svg_width,svg_height,y1,y2,data,that.storage,that.Action_Loc)

                    let glyph_G = insert_G.append('g').classed(`glyph_G${pid}`,true)
                    Object.keys(this.Action_Loc).forEach(item=>{
                        that.drawGlyphs(glyph_G,this.Action_Loc[item].x,this.Action_Loc[item].y,this.Action_Loc[item].act,[translate_x,start_y,y1])
                    })
                })
                insert_G.attr('transform',`translate(${0},${0})`)
            })

        },
        drawStorage(store_G,svg_width,svg_height,y1,y2,data,storage,Action_Loc){
            let that = this
            //sorted_actions
            let sorted_actions = data['sorted_actions']
            let loop_check = data['loop'].length >0
            if(loop_check){
                let none_loop_segments = data['none_loop_segments']
                let loop_segments = data['loop_segments']
                let actions = [...none_loop_segments[0][4]]
                none_loop_segments.forEach((seg,seg_idx)=>{
                    if(seg_idx>0){
                        let loops = [...loop_segments].filter(item=>item[0]==seg_idx-1).map(item=>item[4])
                        console.log(loops)
                        actions = [...actions,...loops[0],...loops[1],...seg[4]]
                    }
                })      
                console.log(actions)
                sorted_actions = actions           
            }


            let slots = Object.keys(storage)
            console.log(slots,sorted_actions)
            let strip = svg_height*0.4
            let x_scale = d3.scaleLinear().domain([-1,slots.length]).range([strip, svg_width-strip])
            let lil_height = 0.1*that.actSizeD['SLOT']
            this.lil_height = lil_height
            let path_y = y1 + svg_height/4
            let storage_y = y2 - svg_height/4
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

                    let content_y = storage_y
                    let content_x = x_scale(parseInt(act[5]))+(slots_written[parseInt(act[5])]+1)*that.actSizeD['SLOT']

                    let path = `M${Action_Loc[idx].x} ${Action_Loc[idx].y+that.actSizeD['WRITE']} V${control_y1}`
                    let center_x = x_scale(parseInt(act[5]))+0.5*that.actSizeD['SLOT']
                    let slot_idx = slots_written[act[5]]
                    path += `C${Action_Loc[idx].x} ${control_y}, ${content_x} ${control_y} ${content_x} ${storage_y}`
                    let line_color = that.actColor['LINE']
                    let write_content = act[6]
                    if(act[4]=='mapping'){
                        write_content = act[7]
                    }
                    if(write_content.includes('CALLER') | write_content.includes('CALLVALUE')){
                        line_color = that.actColor['WRITE']
                    }
                    store_G.append('path').classed('interaction',true)
                        .attr('d',path).attr('fill','none').attr("stroke",line_color).attr("stroke-width",1)
                    //draw slot content

                    that.drawSlotContents(store_G,content_x,content_y,0.5*(x_scale(1)-x_scale(0)),write_content)
                    if(write_content=='CALLER'){
                        that.caller_slot.push(act[5])
                    }
                }else if(act[0]=='PAY'&&Number.isInteger(act[4])){
                    let center_x = x_scale(parseInt(act[4]))+0.5*that.actSizeD['SLOT']
                    let path = `M${Action_Loc[idx].x} ${Action_Loc[idx].y+that.actSizeD['PAY']} V${control_y1} C${Action_Loc[idx].x} ${control_y}, ${center_x} ${control_y}, ${center_x} ${storage_y}`
                    store_G.append('path').classed('interaction',true)
                        .attr('d',path).attr('fill','none').attr("stroke",that.actColor['PAY']).attr("stroke-width",1)
                    that.pay_slot.push(act[4])
                }
            })
            //draw the slot glyphs
            let critical_slots = [...that.caller_slot].filter(item=>[...that.pay_slot].includes(item))
            console.log(critical_slots,storage_y)
            slots.forEach(item=>{
                let check = critical_slots.includes(parseInt(item))
                that.drawSlots(store_G,x_scale(parseInt(item)),storage_y,storage[item],lil_height,check)
                store_G.append('text')
                        .attr('x',x_scale(parseInt(item))-3).attr('y',storage_y+0.5*that.actSizeD['SLOT'])
                        .attr('text-anchor','end').attr('dominant-baseline','middle')
                        .attr('font-family','Arial').attr('font-weight','bold')
                        .attr('font-size',10).attr('fill','black')
                .text(`#[${item}]`)
            })
        },
        drawSlots(svg,x,y,slot_data,lil_height,check){
            console.log(x,y,slot_data,lil_height,check)
            let that = this
            let width = that.actSizeD['SLOT']
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
        drawSlotContents(svg,x,y,max_size,content){
            max_size = Math.min(max_size,0.5*this.actSizeD['SLOT'])
            let r = 0.9*max_size
            let cy = y+0.5*this.actSizeD['SLOT']
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
        drawActionSeq(svg,pid,data,y1,y2,svg_width){
            console.log(data)
            //remove g
            d3.select(`g.act_G${pid}`).remove()
            let that = this
            let act_G = svg.append('g').classed(`act_G${pid}`,true)

            let svg_height = y2-y1
            let path_y = y1 + svg_height/4
            let o_path = data['path']
            let sorted_actions = data['sorted_actions']
            // that.drawActions3(svg,svg_width,svg_height,path_y,o_path,data)
            let Action_Loc = {}
            let cursor = 0
            let cursor_height = 0
            let x_mapping = d3.scaleLinear().domain([0,1]).range([0,1])
            let loop_point = data['loop']
            if(loop_point.length>0){// if there is a loop
                let none_loop_segments = data['none_loop_segments']
                let loop_segments = data['loop_segments']

                //CACULATE THE LOCATION
                let max_loop_len = 0
                let loop_range = []
                none_loop_segments.forEach((seg,seg_idx)=>{
                    if(seg_idx==0){ //before loop
                        seg[4].forEach((act)=>{
                            Action_Loc[cursor] = {
                                y: path_y,
                                x: cursor_height + that.actSizeD[act[0]]+ that.actSizeD['STROKE'] + that.actSizeD['GAP'],
                                act:act
                            }
                            cursor_height += 2*(that.actSizeD[act[0]]+that.actSizeD['STROKE'] + that.actSizeD['GAP'])
                            cursor += 1
                        })
                    }else{
                        let loop_data = loop_segments.slice((seg_idx-1)*2,(seg_idx-1)*2+2)
                        let len = loop_data[0][4].length
                        let data1 = loop_data[0][4]
                        let data2 = loop_data[1][4]
                        // adjust the size of looop
                        let b = sorted_actions.length * 0.04
                        let pathData = that.ArchimedeanSpiral(0,b,0.01,path_y,cursor_height,len)
                        console.log(pathData,cursor_height)
                        // keep the parameter of spiral
                        loop_range.push([0,b,0.01,path_y,cursor_height,len])
                        cursor_height = pathData[2][1] + that.actSizeD['PAY']
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
                                x: cursor_height + that.actSize[act[0]]+ that.actSizeD['STROKE'] + that.actSizeD['GAP'],
                                act:act
                            }
                            cursor_height += 2*(that.actSize[act[0]]+that.actSizeD['STROKE'] + that.actSizeD['GAP'])
                            cursor += 1
                        })
                    }
                })

                x_mapping = d3.scaleLinear().domain([0,cursor_height]).range([0,svg_width-that.margin.right])

                let ratio = (x_mapping(1)-x_mapping(0))
                let line_start = 0
                console.log(loop_range)
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
                        .attr('y2',path_y).attr('x2',pathData[2][3]-that.actSizeD['PAY'])
                        .attr('stroke',that.actColor['LINE'])
                        .attr('stroke-width',that.actSizeD['LINE'])
                        .attr('stroke-dasharray','2,1')
                    //draw the spiral
                    act_G.append('path')
                        .attr("d",pathData[0]).attr('fill','none').attr("stroke-width",that.actSizeD['LINE']).attr('stroke',that.actColor['LINE'])
                    act_G.append('path')
                        .attr("d",pathData[1]).attr('fill','none').attr("stroke-width",that.actSizeD['LINE']).attr('stroke','black')
                })
                // draw the  last line
                act_G.append("line")
                        .attr('y1',path_y).attr('x1',line_start)
                        .attr('y2',path_y).attr('x2',that.svgWidth)
                        .attr('stroke',that.actColor['LINE'])
                        .attr('stroke-width',that.actSizeD['LINE'])
                let new_Action_Loc = {}
                Object.keys(Action_Loc).forEach(idx=>{
                    let action_data = Action_Loc[idx]
                    let new_y = path_y + (action_data.y - path_y)*ratio
                    new_Action_Loc[idx] = {
                        y:new_y,
                        x:x_mapping(action_data.x),
                        act:action_data.act
                    }
                })
                Action_Loc = new_Action_Loc

            }else{//there is no loop
                console.log('there is no loop')
                x_mapping = d3.scaleLinear().domain([-1,sorted_actions.length]).range([that.margin.left,that.margin.left+svg_width])
                act_G.append("line")
                        .attr('y1',path_y).attr('x1',0)
                        .attr('y2',path_y).attr('x2',that.svgWidth)
                        .attr('stroke',that.actColor['LINE'])
                        .attr('stroke-width',that.actSizeD['LINE'])
                sorted_actions.forEach((act,idx)=>{
                    Action_Loc[idx] = {
                        y:path_y,
                        x: x_mapping(idx),
                        act:act
                    }
                })
            }
            this.storage_y = svg_height*0.95
            this.Action_Loc = Action_Loc
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
        // actions glyphs
        drawGlyphs(svg,cx,cy,act,shift){
            let that = this
            let glyph_G = svg.append('g').classed(`${act[0]}`,true)
            if(act[act.length-1]=='callback' | act[act.length-1]=='update'){
                glyph_G.append('circle')
                    .attr('cx',cx).attr('cy',cy).attr('r',that.actSizeD[act[0]]+that.actSizeD['STROKE']).attr('fill','white')
                    .attr('stroke',that.actColor[act[0]]).attr('stroke-width',that.actSizeD['STROKE'])
            }
            glyph_G.append('circle')
                    .attr('cx',cx).attr('cy',cy).attr('r',that.actSizeD[act[0]]).attr('fill',that.actColor[act[0]])
            glyph_G.append('text')
                    .attr('x',cx).attr('y',cy+1)
                    .attr('text-anchor','middle').attr('dominant-baseline','middle')
                    .attr('font-family','Arial').attr('font-weight','bold')
                    .attr('font-size',that.actSizeD['TEXT']).attr('fill','white')
                    .text(`${act[0].slice(0,1)}`)
            glyph_G.on("mouseover",function(_event){
                    that.hover_act(_event,act,[cx+shift[0],cy+shift[1]-shift[2]])
                    console.log(act)
                }).on("mouseout",function(_event){
                    that.out_act()
                })

        },
        dataInit(data){
            let Paths_Data = {}
            console.log(data)
            Object.keys(data).forEach((key,idx)=>{
                if(key!='storage'){
                    let check = true
                    // let loop_point = data[key]['loop']
                    // if(loop_point.length>0){
                    //     loop_point.forEach(p=>{
                    //         let len = JSON.parse(key).filter(item=>item==p).length
                    //         if(len!=3){
                    //             check = false
                    //         }
                    //         let len2 = data[key]['sortedActions'].filter(item=>item[1]==p).length
                    //         if(len2<3){
                    //             check = false
                    //         }
                    //     })
                    // }
                    if(check){
                        Paths_Data[idx] = {
                            path:JSON.parse(key),
                            sorted_actions:data[key]['sortedActions'],
                            loop:data[key]['loop']
                        }
                    }
                }else{
                    this.storage = data[key]
                    console.log(data[key],this.storage)
                }
            })
            console.log(Paths_Data)
            let groups = {} // paths_groups
            Object.keys(Paths_Data).forEach(pid=>{
                console.log(JSON.parse(JSON.stringify(Paths_Data[pid])))
                let path = Paths_Data[pid].path
                let actions = Paths_Data[pid].sorted_actions
                let loop_point = [...Paths_Data[pid].loop].sort((a,b)=>path.indexOf(parseInt(a))-path.indexOf(parseInt(b)))

                let labels = [0,0,0,0]//[loop,pay]

                if(loop_point.length>0){//there is a loop
                    let old_loop_point = [...loop_point]
                    console.log(pid)
                    //check overlap of loop points
                    if(loop_point.length>1){
                        let i = 0
                        while(i<loop_point.length){
                            let find_check = false
                            let count = 0
                            let current = loop_point[i]
                            path.forEach(bb=>{
                                if(bb==current&&!find_check){
                                    find_check = true
                                    count += 1
                                }else if(bb==current&&find_check&&count<2){
                                    count += 1
                                }else if(bb==current&&count>=2){
                                    find_check = false
                                }
                                if(find_check&&loop_point.includes(bb)&&bb!=current){
                                    loop_point = [...loop_point].filter(item=>item!=bb)
                                }
                            })
                            i += 1
                        }
                        Paths_Data[pid]['loop'] = loop_point
                    }

                    console.log(loop_point)
                    
                    // segment the actions
                    let flag = 0
                    let finish = false
                    let p_index = 0
                    let start_idx = 0
                    let none_loop_segments = []
                    let loop_segments = []
                    let first_ins_idx = 0
                    // console.log(pid,actions)
                    actions.forEach((item,idx)=>{
                        if(flag==0 && item[1] == loop_point[p_index]){ //first reach loop point
                            flag = 1
                            let seg = actions.slice(start_idx,idx)
                            none_loop_segments.push(['none',start_idx,idx, seg.length, seg])
                            start_idx = idx
                            first_ins_idx = item[3]
                        }else if(flag==1 && item[1] != loop_point[p_index]){ //judgement of whether pass the loop point
                            finish = true
                        }else if(finish==true && flag==1 && item[1] == loop_point[p_index]){// segment of the round  2 of loop
                            let seg = actions.slice(start_idx,idx)
                            loop_segments.push([p_index,start_idx, idx, seg.length, seg])
                            flag = 2
                            finish = false
                            start_idx = idx
                        }else if(flag==2 && finish==false && item[1] != loop_point[p_index]){ //judgement of whetehr pass the second loop point
                            finish = true
                        }else if(flag==2 && finish==true && item[1] == loop_point[p_index]){// 
                            let seg = actions.slice(start_idx,idx)
                            loop_segments.push([p_index,start_idx, idx, seg.length, seg])
                            flag = 0
                            finish = false
                            start_idx = idx
                            p_index += 1
                            
                        }else if(finish == false && item[1]==loop_point[p_index] && item[3]==first_ins_idx){
                            //if loop point is linked together
                            // console.log(idx,loop_point)
                            let seg = actions.slice(start_idx,idx)
                            loop_segments.push([p_index,start_idx, idx, seg.length, seg])
                            start_idx = idx
                            finish = true
                        }
                    })
                    let seg = actions.slice(start_idx)
                    none_loop_segments.push(['none',start_idx,actions.length, seg.length, seg])

                    console.log(none_loop_segments,loop_segments)
                    // fix the bug of cut more than 2 loop data
                    for(let i=0;i<none_loop_segments.length-1;i++){
                        let L_data = [...loop_segments].filter(item=>item[0]==i)

                        if(L_data.length>2){
                            let start = 0
                            let end = 0
                            let count = 0
                            let actions = []
                            L_data.forEach((item,idx)=>{
                                if(idx>0){
                                    if(idx==1){
                                        start = item[1]
                                        end = item[2]
                                        actions = item[4]
                                    }else{
                                        end = item[2]
                                        actions = [...actions,...item[4]]
                                        count+=item[3]
                                    }
                                }
                            })
                            loop_segments = [...loop_segments].filter(item=>item[0]!=i)
                            loop_segments.push(L_data[0])
                            loop_segments.push([i,start,end,count,actions])
                        }else if(L_data.length<2){
                            loop_segments.push(L_data[0])
                        }
                    }
                    console.log(none_loop_segments,loop_segments)
                    //deal with the different lens of loop
                    let new_loop_segments = []
                    let new_none_loop_segments = []
                    let cursor_difference = 0
                    none_loop_segments.forEach((seg,seg_idx)=>{
                        if(seg_idx==0){
                            new_none_loop_segments = [...new_none_loop_segments,seg]
                        }else{
                            let loop_data = loop_segments.slice((seg_idx-1)*2,(seg_idx-1)*2+2)
                            let len1 = loop_data[0][4].length
                            let len2 = loop_data[1][4].length
                            let data1 = loop_data[0][4]
                            let data2 = loop_data[1][4]
                            if(len1!=len2){
                                let diff1 = [...data1].filter(item=>!data2.map(item=>item[3]).includes(item[3]))
                                let diff2 = [...data2].filter(item=>!data1.map(item=>item[3]).includes(item[3]))
                                actions = [...actions].filter(item=>![...diff1,...diff2].includes(item)) 
                                data1 = [...data1].filter(item=>data2.map(item=>item[3]).includes(item[3]))
                                data2 = [...data2].filter(item=>data1.map(item=>item[3]).includes(item[3]))
                            }

                            let new_len = data1.length
                            let start = loop_data[0][1] + cursor_difference
                            new_loop_segments = [...new_loop_segments,[seg_idx-1,start,start+new_len,new_len,data1],[seg_idx-1,start+new_len,start+new_len*2,new_len,data2]]
                            //remove loop points in the none loop parts
                            let new_seg_acts = [...seg[4]].filter(item=>!old_loop_point.includes(item[1]))
                            let new_diff_acts = [...seg[4]].filter(item=>old_loop_point.includes(item[1]))
                            // console.log(new_diff_acts,actions,[...actions].filter(item=>[...new_diff_acts].map(item=>item.toString()).includes(item.toString())))
                            actions = [...actions].filter(item=>![...new_diff_acts].map(item=>item.toString()).includes(item.toString()))
                            let loop_len_diff =  new_seg_acts.length - seg[4].length
                            cursor_difference += 2*new_len - len1 - len2
                            let befroe_cursor_diff = cursor_difference
                            cursor_difference += loop_len_diff
                            new_none_loop_segments = [...new_none_loop_segments,[seg[0], seg[1]+befroe_cursor_diff, seg[2]+cursor_difference, new_seg_acts.length,new_seg_acts]]
                        }
                    })
                    Paths_Data[pid]['sorted_actions'] = actions
                    Paths_Data[pid]['loop_segments'] = new_loop_segments
                    Paths_Data[pid]['none_loop_segments'] = new_none_loop_segments

                    this.Paths_Data = Paths_Data
                    //segment end ===================================================
                    //label loop
                    labels[this.label_idx['Loop']] = Paths_Data[pid]['none_loop_segments'].length-1
                }else{//there is no loop
                    this.Paths_Data = Paths_Data
                }

                //label WriteCaller
                let write_caller = Paths_Data[pid]['sorted_actions'].filter(item=>item[0]=='WRITE'&& (item[6]=='CALLER'|item[7]=='CALLER'))
                let write_count =  write_caller.length
                labels[this.label_idx['WriteCaller']] = write_count

                //slots have saved caller
                let caller_slots = []
                if(write_count>0){
                    write_caller.forEach(item=>{
                        if(!caller_slots.includes(item[5])){
                            caller_slots.push(item[5])
                        }
                    })
                }
                //label pay
                let payinvestor = []
                let pay_actions = Paths_Data[pid]['sorted_actions'].filter(item=>item[0]=='PAY')
                let pay_count = pay_actions.length
                labels[this.label_idx['Pay']] = pay_count
                //label same slots
                if(pay_count>0){
                    pay_actions.forEach(item=>{
                        if(caller_slots.includes(item[4])){
                            labels[this.label_idx['PayInvestor']] += 1
                            payinvestor.push([item,item[4],[...write_caller].filter(w=>w[5]==item[4])])
                        }
                    })
                }
                // console.log(labels)
                let pure_label = labels.map(item=>item>0?1:0)
                this.Paths_Data[pid]['labels'] = [pure_label,labels]
                this.Paths_Data[pid]['features'] = {
                                                        'write_caller':write_caller,
                                                        'payinvestor':payinvestor
                                                    }

                if(!Object.keys(groups).includes(pure_label.toString())){
                    groups[pure_label.toString()] = [[pid,labels]]
                }else{
                    groups[pure_label.toString()] = [...groups[pure_label.toString()],[pid,labels]]
                }
            })
            this.groups = groups
            console.log(Paths_Data)
            console.log(groups)
            //data init end==================================================================
        },
        update_selected_loc(data){
            let without = [...this.selected_group_loc].filter(item=>item[0]!=data[0])
            this.selected_group_loc = [...without,data]
        },
        drawFilter2(svg,start,end,height,width){
            //remove g
            let that = this
            d3.select('g.filter_G').remove()

            let filter_G = svg.append('g').classed("filter_G",true)
            //add gradient
            let defs = filter_G.append('defs')
            let G1 = defs.append('linearGradient')
                        .attr("id",'d2l')
                        .attr("x1",'100%').attr("y1",'0%').attr("x2",'0%').attr("y2",'0%')
            G1.append('stop').attr('offset','0%').attr("style",`stop-color: ${that.actColor['D_FILTER']}`)
            G1.append('stop').attr('offset','100%').attr("style",`stop-color:${that.actColor['L_FILTER']}`)
            let G2 = defs.append('linearGradient')
                        .attr("id",'l2d')
                        .attr("x1",'100%').attr("y1",'0%').attr("x2",'0%').attr("y2",'0%')
            G2.append('stop').attr('offset','0%').attr("style",`stop-color: ${that.actColor['L_FILTER']}`)
            G2.append('stop').attr('offset','100%').attr("style",`stop-color:${that.actColor['D_FILTER']}`)
        
            
            let groups = this.groups
            console.log(groups)
            let groups_id = Object.keys(groups)

            let sorted_groups_id = [...groups_id].sort((a,b)=>{
                    let new_a = a.split(',').map(item=>parseInt(item))
                    let new_b = b.split(',').map(item=>parseInt(item))
                    for(let i=0;i<new_a.length;i++){
                        let res = new_b[i] - new_a[i]
                        if(res!=0){
                            return res
                        }
                    }
            })
            console.log(sorted_groups_id)
            let label_len = Object.keys(that.label_idx).length
            let group_len = groups_id.length
            let x_scale = d3.scaleLinear().domain([-0.5,label_len-1]).range([start,end])


            let path_count = d3.sum([...groups_id].map(item=>groups[item].length))
            let gap1 = 0.02 * path_count/group_len
            let gap2 = gap1 * 15
            let path_width = 1

            console.log(path_count)
            let total_height = path_count + gap2 + group_len * gap1 * 2
            let y_scale = d3.scaleLinear().domain([0,total_height]).range([that.margin.top+15,that.margin.top+height])
            //unfold
            let unfold_height = total_height 
            let unfold_count = that.selected_group_paths.length
            // let unfold_y_scale = d3.scaleLinear().domain([0,total_height]).range([that.margin.top+15,that.margin.top+height])
            let y_gap = y_scale(1)-y_scale(0)
            let f_height = 7
            let inner_gap = f_height*0.1
            //draw filter
            let last_parts = {}
            let start_parts = {}
            for(let j=0;j<label_len;j++){
                let x = x_scale(j)
                // if(0<j&&j<label_len-1){
                //     x = x_scale(j-0.5)
                // }
                let y_cursor = 0
                let left_part = sorted_groups_id.filter(item=>{
                    return item.split(',').map(item=>parseInt(item))[j] == 1
                })
                let right_part = sorted_groups_id.filter(item=>{
                    return item.split(',').map(item=>parseInt(item))[j] == 0
                })
                console.log(left_part,right_part)
                left_part.forEach(item=>{
                    console.log(item)
                    let path_num = groups[item].length
                    if(path_num>0){
                        let group_width = path_width*path_num
                        y_cursor += gap1
                        let y = y_scale(y_cursor)
                        let w = group_width*y_gap
                        if(j>0){
                            let p_data = last_parts[item]
                            let p_d = `M${p_data[0]} ${p_data[1]+inner_gap} L${x} ${y+inner_gap} v${w-2*inner_gap} L${p_data[0]} ${p_data[1]+p_data[2]} z`
                            let fill_color = that.actColor['D_FILTER']
                            if(p_data[4]==0){
                                fill_color = `url(#${'d2l'})`
                            }
                            // connections
                            filter_G.append('path')
                                .attr('d',p_d).attr('fill',fill_color)
                                // .attr('stroke',that.actColor['L_FILTER'])
                                .attr('opacity',0.5)
                                .on("click",function(_event){
                                        that.remove_group(item)
                                    })
                        }
                        // basic rect
                        filter_G.append('rect')
                            .attr('x',x).attr('y',y).attr('width',f_height).attr('height',w)
                            .attr('rx',f_height*0.1).attr('ry',f_height*0.1)
                            // .attr('stroke',that.actColor['D_FILTER']).attr('stroke-width',1)
                            .attr('fill',that.actColor['D_FILTER'])
                            .on("click",function(_event){
                                        that.remove_group(item)
                                    })
                        last_parts[item] = [x+f_height,y,w,f_height,1]
                        y_cursor += gap1 + group_width
                    }
                    if(j==label_len-1){
                        if(that.selected_group_paths.map(g=>g[0]).includes(item)){
                            y_cursor += unfold_height
                            d3.select('svg.Path')
                                .attr('height',that.svgHeight+unfold_count*unfold_height*y_gap)
                            that.update_selected_loc([item,y_scale(y_cursor-unfold_height),y_scale(y_cursor)])
                        }
                    }
                    // if(that.selected_group_paths.map(g=>g[0]).includes(item)){
                    //         y_cursor += unfold_height
                    //         d3.select('svg.Path')
                    //             .attr('height',that.svgHeight+unfold_count*unfold_height*y_gap)
                    //     }
                })
                //add line
                // if(left_part.length>0 && j<label_len-1){
                //     filter_G.append('line')
                //         .attr("x1",x).attr("y1",y_scale(0+gap1))
                //         .attr("x2",x).attr("y2",y_scale(y_cursor-gap1))
                //         .attr("stroke",that.actColor['D_FILTER']).attr("stroke-width",3)
                // }
                y_cursor += gap2
                //add line
                let line_start = y_scale(y_cursor+gap1)

                right_part.forEach(item=>{
                    let path_num = groups[item].length
                    let group_width = path_width*path_num
                    y_cursor += gap1
                    let y = y_scale(y_cursor)
                    let w = group_width*y_gap
                    if(j>0){
                        console.log(last_parts[item])
                        let p_data = last_parts[item]
                        let p_d = `M${p_data[0]} ${p_data[1]+inner_gap} L${x} ${y+inner_gap} v${w-2*inner_gap} L${p_data[0]} ${p_data[1]+p_data[2]} z`
                        let fill_color = that.actColor['L_FILTER']
                        if(p_data[4]==1){
                            fill_color = `url(#${'l2d'})`
                        }
                        filter_G.append('path')
                            .attr('d',p_d).attr('fill',fill_color)
                            // .attr('stroke',that.actColor['L_FILTER'])
                            .attr('opacity',0.5)
                    }

                    filter_G.append('rect')
                        .attr('x',x).attr('y',y).attr('width',f_height).attr('height',w)
                        .attr('rx',f_height*0.1).attr('ry',f_height*0.1)
                        .attr('stroke',that.actColor['D_FILTER']).attr('stroke-width',1)
                        .attr('fill',that.actColor['L_FILTER'])
                        .on("click",function(_event){
                                        that.remove_group(item)
                                    })
                    last_parts[item] = [x+f_height,y,w,f_height,0]
                    y_cursor += gap1 + group_width

                    if(j==label_len-1){
                        if(that.selected_group_paths.map(g=>g[0]).includes(item)){
                            y_cursor += unfold_height
                            d3.select('svg.Path')
                                .attr('height',that.svgHeight+unfold_count*unfold_height*y_gap)
                            
                            that.update_selected_loc([item,y_scale(y_cursor-unfold_height),y_scale(y_cursor)])
                        }
                    }
                    // if(that.selected_group_paths.map(g=>g[0]).includes(item)){
                    //         y_cursor += unfold_height
                    //     }
                })
                //add line
                // if(right_part.length>0 && j<label_len-1){
                //     filter_G.append('line')
                //     .attr("x1",x).attr("y1",line_start)
                //     .attr("x2",x).attr("y2",y_scale(total_height-gap1))
                //     .attr("stroke",that.actColor['D_FILTER']).attr("stroke-width",3)
                // }
            }
            //update start parts
            start_parts = JSON.parse(JSON.stringify(last_parts));

            Object.keys(that.label_idx).forEach((item,idx)=>{
                let content = item
                filter_G.append('text')
                    .attr('x',x_scale(that.label_idx[item])).attr('y',that.margin.top+10)
                    .attr('text-anchor','middle').attr('dominant-baseline','top')
                    .attr('font-family','Arial').attr('font-weight','bold')
                    .attr('font-size',10)
                    .text(content)
            })

            that.drawMergePath2(svg,start_parts,groups,this.Paths_Data,end+f_height,width)

        },
        drawMergePath2(svg,start_parts,groups,Paths_Data,start,width){
            console.log(start_parts,groups,Paths_Data)
            //remove g
            let that = this
            d3.select('g.overview_G').remove()

            let right = that.svgWidth - that.margin.right
            let overview_G = svg.append('g').classed('overview_G',true)

            let group_ids = Object.keys(start_parts)

            //for each group
            group_ids.forEach(item=>{
                let group_name = item
                let location = start_parts[item]
                //1. Rank the paths by the number of Features (numbers of loops, write callers, pay) (make the path more important higher ranking)
                // let paths = [...groups[item]]
                let paths = [...groups[item]].sort((a,b)=>{ //sorted paths
                    for(let i=0;i<a[1].length;i++){
                        let res = b[1][i] - a[1][i]
                        if(res!=0){
                            return res
                        }
                    }
                })
                console.log(location,paths)

                let y_scale = d3.scaleLinear().domain([-1,paths.length]).range([location[1],location[1]+location[2]])
                let y_gap = y_scale(1)-y_scale(0)
                that.r = 0.4*y_gap>5?5:0.4*y_gap

                //collect the bb sequence of each path
                // paths <==> combine_bb_visited
                let combine_bb_visited = []
                paths.forEach((item,idx)=>{
                    let pid = item[0]
                    let p_data = Paths_Data[pid]
                    let actions = p_data['sorted_actions']
                    // console.log(p_data)
                    if(p_data['loop'].length>0){ // have loop
                        let none_loop_segments = p_data['none_loop_segments']
                        let loop_segments = p_data['loop_segments']
                        actions = none_loop_segments[0][4]
                        let loop_range = []
                        let cursor = actions.length
                        for(let i=0;i<none_loop_segments.length-1;i++){
                            let loop_data = loop_segments.filter(item=>item[0]==i)[0]
                            actions = [...actions,...loop_data[4],...none_loop_segments[i+1][4]]
                            cursor = actions.length 
                            loop_range.push([...loop_data[4].map(item=>item[1])])
                        }
                        Paths_Data[pid]['sorted_actions'] = actions
                        Paths_Data[pid]['loop_range'] = loop_range
                    }
                    let bb_visited = []
                    actions.forEach(act=>{
                        if(!bb_visited.includes(act[1])){
                            bb_visited.push(act[1])
                        }
                    })
                    combine_bb_visited.push(bb_visited)
                })
                console.log(paths,combine_bb_visited)

                // 2. Divide paths into sub-groups that can be merged (rule-based), and generate a longest basic block sequence for layout computing and visualization.
                let sub_groups = []
                let now_group = []
                let merge_degree = 5
                let longest_sequence = [...combine_bb_visited[0]]

                // for each path in the group
                combine_bb_visited.forEach((bbs,idx)=>{
                    console.log(`path:${idx}`,bbs)
                    //rule 1: with same basic block (intersection > 0)
                    let intersection_list = [...bbs].filter(item=>longest_sequence.includes(item))
                    let check1 = intersection_list.length>0

                    //rule 2: total number of different > threshold (blocks Union set minus Intersection)
                    let union_list = new Set([...bbs,...longest_sequence])
                    let UminusI = new Set([...union_list].filter(item=>!intersection_list.includes(item)))
                    let check2 = [...UminusI].length < merge_degree

                    //rule 3: campare with the longest sequence, there is no loop (intersection have same order)
                    let check3 = true
                    for(let i=1;i<[...intersection_list].length;i++){
                        let idx1 = longest_sequence.indexOf([...intersection_list][i-1])
                        let idx2 = longest_sequence.indexOf([...intersection_list][i])
                        if(idx1>idx2){
                            check3 = false
                        }
                    }

                    // check whether need merge  
                    if(check1 && check2 && check3){ 
                        // add bb in the now group
                        now_group.push(idx)
                        let longest_cursor = 0
                        let bbs_cursor = 0
                        // insert bb in the longest sequence
                        while(bbs_cursor<bbs.length){
                            if(!longest_sequence.includes(bbs[bbs_cursor])){
                                longest_sequence.splice(longest_cursor+1,0,bbs[bbs_cursor])
                                longest_cursor += 1
                                bbs_cursor += 1
                            }else{
                                longest_cursor = longest_sequence.indexOf(bbs[bbs_cursor])
                                bbs_cursor += 1
                            }
                        }
                    }else{// not satisfy the 3 rules, create a new group
                        sub_groups.push([now_group,longest_sequence])
                        now_group = [idx]
                        longest_sequence = combine_bb_visited[idx]
                    }
                })
                sub_groups.push([now_group,longest_sequence])
                // console.log(sub_groups,combine_bb_visited)

                console.log(sub_groups)
                //3. In each sub-group,
                sub_groups.forEach(item=>{
                    // console.log(item)
                    let group_ids = item[0] // pid in the group
                    let longest_sequence = item[1]

                    //construct final data
                    let final_data = {}

                    //  for each block in the longest sequences:
                    longest_sequence.forEach((bb,bb_idx)=>{
                        let paths_with_bb = [...group_ids].filter(item=>combine_bb_visited[item].includes(bb))
                        let paths_without_bb = [...group_ids].filter(item=>!combine_bb_visited[item].includes(bb))
                        
                        // let paths_with_bb,paths_without_bb
                        // if(bb_idx==0){
                        //     paths_with_bb = group_ids.filter(item=>combine_bb_visited[item].includes(bb))
                        //     paths_without_bb = group_ids.filter(item=>!combine_bb_visited[item].includes(bb))
                        // }else{
                        //     let last_bb_data = final_data[bb_idx-1]
                        //     let last_with_bb = last_bb_data['paths_with_bb']
                        //     let last_without_bb = last_bb_data['paths_without_bb']
                        //     console.log(last_bb_data)

                        //     paths_with_bb = [...last_with_bb,...last_without_bb].filter(item=>combine_bb_visited[item].includes(bb))
                        //     paths_without_bb = [...last_with_bb,...last_without_bb].filter(item=>!combine_bb_visited[item].includes(bb))
                        // }

                        //block info initial
                        let blocks_info = {
                            'block_number': bb,
                            'paths_with_bb':paths_with_bb,
                            'paths_without_bb':paths_without_bb,
                            'actions_info':{},
                            'longest_actions':[]
                        }

                        //for paths with bb
                        //==== get longest action sequence in the with group
                        // console.log(bb)
                        let longest_actions = []
                        paths_with_bb.forEach((pid_in_group,pid_in_sub)=>{
                            let pid = paths[pid_in_group][0]
                            let p_data = Paths_Data[pid]
                            let sorted_actions_bb = p_data['sorted_actions'].filter(item=>item[1]==bb)
                            // console.log(pid,p_data,sorted_actions_bb)
                            if(longest_actions.length==0){
                                longest_actions = [...sorted_actions_bb].map(item=>item[3])
                            }else{
                                if(longest_actions.toString()!=[...sorted_actions_bb].map(item=>item[3]).toString()){
                                    sorted_actions_bb.forEach(act=>{
                                        if(!longest_actions.includes(act[3])){
                                            let lower_id = 0
                                            longest_actions.forEach((act_id,index)=>{
                                                if(act[3]>act_id){
                                                    lower_id = index
                                                }
                                            })
                                            longest_actions.splice(lower_id+1,0,act[3])
                                        }
                                    })
                                }
                            }
                            // console.log(longest_actions)
                        })
                        // push longest actions
                        blocks_info['longest_actions'] = longest_actions

                        //====for each action with same ins_id, check whether the parameters are the same
                        let actions_info = {}
                        longest_actions.forEach((act,act_idx)=>{
                            let paths_with_act = paths_with_bb.filter(p=> [...Paths_Data[paths[p][0]]['sorted_actions']].filter(a=>a[3]==act).length>0)
                            let paths_without_act = paths_with_bb.filter(p=> [...Paths_Data[paths[p][0]]['sorted_actions']].filter(a=>a[3]==act).length==0)
                            
                            let group_by_param = {}
                            paths_with_act.forEach(pid_in_group=>{
                                let pid = paths[pid_in_group][0]
                                let p_data = Paths_Data[pid]
                                let action = p_data['sorted_actions'].filter(item=>item[3]==act)[0]
                                // console.log(pid_in_group,action)
                                let param = action.slice(4)
                                if(param in group_by_param){
                                    group_by_param[param][0] = [...group_by_param[param][0],pid_in_group]
                                }else{
                                    group_by_param[param] = [[pid_in_group],action]
                                }
                            })
                            if(paths_without_act.length>0){
                                group_by_param['paths_without_act'] = paths_without_act
                            }
                            // console.log(group_by_param)
                            let act_info = {
                                'action_number': act,
                                'group_by_param':group_by_param,
                            }
                            actions_info[act_idx] = act_info
                        })
                        blocks_info['actions_info'] = actions_info
                    
                        // push the block info
                        final_data[bb_idx] = blocks_info
                    //longest sequence for each end----------------------
                    })

                    console.log(final_data) //for sub group
                    // caculate the layout of visualizations
                    let group_len = group_ids.length
                    let y_scale_sub = d3.scaleLinear().domain([0,group_len-1]).range([y_scale(group_ids[0]),y_scale(group_ids[group_len-1])])
                    let y_gap = y_scale_sub(1)-y_scale_sub(0)
                    let path_set = {}
                    let node_set = []
                    let last_y_by_pid = {}
                    group_ids.forEach((item,id)=>{
                        last_y_by_pid[item] = y_scale_sub(id)
                        path_set[item] = [[0,y_scale_sub(id)]]
                    })
                    console.log(last_y_by_pid)
                    let path_width = 0.3 //px
                    let x_cursor = 0 //unit
                    let block_gap = 0.5
                    let block_inner_gap = 0.3
                    let node_gap_1 = 0.5 //before 0.5 after 0.5
                    let node_gap_2 = 1 //for nodes with branches before 1 after 1


                    //for each bb
                    let bbs_len = longest_sequence.length
                    for(let i=0;i<bbs_len;i++){
                        let block_info = final_data[i]
                        let paths_with_bb = block_info['paths_with_bb']
                        let paths_without_bb = block_info['paths_without_bb']
                        let longest_actions = block_info['longest_actions']
                        let actions_info = block_info['actions_info']
                        // console.log(paths_with_bb,paths_without_bb,longest_actions,actions_info)
                        // console.log(path_set)
                        //caculate layout
                        let block_x_range = []
                        let block_y_range = []
                        x_cursor += block_gap //gap between block
                        block_x_range[0] = x_cursor

                        x_cursor += block_inner_gap // inner gap boarder | to nodes

                        // group_ids.forEach((pid_in_group,p_idx)=>{
                        //     let y = last_y_by_pid[pid_in_group]
                        //     path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor,y]]
                        // })

                        //caculate the y
                        let center_y = 0.5 * (y_scale_sub(0) + y_scale_sub(group_len-1))
                        let branch_y = center_y
                        let with_count = paths_with_bb.length
                        let without_count = paths_without_bb.length
                        if(paths_without_bb.length==0){ //all link together
                            let total_width = path_width * paths_with_bb.length
                            let start_y = center_y - 0.5 * total_width
                            paths_with_bb.forEach((pid_in_group,p_idx)=>{
                                let y = start_y + (p_idx + 0.5) * path_width
                                // path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor,y]]
                                // last_y_by_pid[pid_in_group] = y
                            })
                        }else{
                                let total_width = path_width * paths_with_bb.length
                                let sub_center_y = 0.5 * (y_scale(paths_with_bb[0]) + y_scale_sub(paths_with_bb[with_count-1]))
                                let start_y = sub_center_y - 0.5 * total_width
                                paths_with_bb.forEach((pid_in_group,p_idx)=>{
                                    let y = start_y + (p_idx + 0.5) * path_width
                                    // path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor,y]]
                                    // last_y_by_pid[pid_in_group] = y
                                })
                                branch_y = sub_center_y
                                //for without bb
                                let total_width2 = path_width * paths_without_bb.length
                                let sub_center_y2 = 0.5 * (y_scale(paths_without_bb[0]) + y_scale_sub(paths_without_bb[without_count-1]))
                                if(Math.abs(sub_center_y2-sub_center_y)<y_gap){
                                    if(sub_center_y>y_scale_sub((group_len-1)/2)){
                                        sub_center_y2 = y_scale_sub(0)
                                    }else{
                                        sub_center_y2 = y_scale_sub(group_len-1)
                                    }
                                }
                                let start_y2 = sub_center_y2 - 0.5 * total_width2
                                paths_without_bb.forEach((pid_in_group,p_idx)=>{
                                    let y = start_y2 + (p_idx + 0.5) * path_width
                                    path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor,y]]
                                    last_y_by_pid[pid_in_group] = y
                                })
                        }

                        block_y_range = [branch_y-0.5*y_gap,branch_y+0.5*y_gap]
                        if(group_ids.length==1){
                            let y_gap_2 = y_scale(1)-y_scale(0)
                            block_y_range = [branch_y-0.4*y_gap_2,branch_y+0.4*y_gap_2]
                        }
                        
                        //for each actions
                        longest_actions.forEach((act_number,act_idx)=>{
                            let act_info = actions_info[act_idx]
                            let group_by_param = act_info['group_by_param']
                            let param_keys = Object.keys(group_by_param)
                            // let paths_without_act = group_by_param['paths_without_act']
                            // console.log(group_by_param, param_keys )

                            if(param_keys.length>1){
                                let param_gap = y_gap * 1.5
                                x_cursor +=  node_gap_2/3
                                //node cx
                                let len = param_keys.length
                                let total_width = len * param_gap
                                let max_width = y_scale_sub(group_len-1)-y_scale_sub(0)
                                if(total_width>y_scale_sub(group_len-1)-y_scale_sub(0)){
                                    total_width = max_width
                                    param_gap = total_width/len
                                }
                                let start_y = branch_y - 0.5*total_width

                                //y range
                                if(start_y<block_y_range[0]){
                                    block_y_range[0] = start_y + 0.2 * param_gap
                                }
                                if(start_y+total_width>block_y_range[1]){
                                    block_y_range[1] = start_y+ total_width -  0.2 * param_gap
                                }

                                param_keys.forEach((param,param_idx)=>{
                                    if(param!= 'paths_without_act'){
                                        let param_len = group_by_param[param][0].length
                                        let y = start_y + (param_idx + 0.5) * param_gap
                                        let total_width_by_param = param_len * path_width
                                        let start_y_param = y - 0.5 * total_width_by_param
                                        // console.log(group_by_param[param],param,y,start_y)
                                        group_by_param[param][0].forEach((pid_in_group,inner_p_idx)=>{
                                            let new_y = start_y_param + (0.5 + inner_p_idx) * path_width
                                            if(act_idx==0){
                                                path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor-node_gap_2/3,new_y]]
                                            }
                                            path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor,new_y]]
                                            path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor+2*node_gap_2/3,new_y]]
                                            // path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor+node_gap_2,last_y_by_pid[pid_in_group]]]
                                            last_y_by_pid[pid_in_group] = new_y
                                        })
                                        console.log(group_by_param[param][0])
                                        node_set.push([x_cursor+node_gap_2/3,y, group_by_param[param][1],group_by_param[param][0]])
                                        // node_set.push([x_cursor+node_gap_2/3,y, group_by_param[param][1]], group_by_param[param][0])
                                    }else{
                                        let param_len = group_by_param[param].length
                                        let y = start_y + (param_idx + 0.5) * param_gap
                                        let total_width_by_param = param_len * path_width
                                        let start_y_param = y - 0.5 * total_width_by_param
                                        // console.log(group_by_param[param],param,y,start_y)
                                        group_by_param[param].forEach((pid_in_group,inner_p_idx)=>{
                                            let new_y = start_y_param + (0.5 + inner_p_idx) * path_width
                                            path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor,new_y]]
                                            path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor+2*node_gap_2/3,new_y]]
                                            // path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor+node_gap_2,last_y_by_pid[pid_in_group]]]
                                            last_y_by_pid[pid_in_group] = new_y
                                        })
                                    }
                                })
                                x_cursor += node_gap_2*2/3
                                x_cursor += node_gap_2/3
                            }else{
                                x_cursor += 1 * node_gap_1

                                let len = group_by_param[param_keys[0]][0].length
                                let total_width = len *  path_width
                                let start_y = branch_y - 0.5 * total_width

                                group_by_param[param_keys[0]][0].forEach((pid_in_group,inner_p_idx)=>{
                                    let new_y = start_y + (0.5 + inner_p_idx) * path_width 
                                    path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor-node_gap_1,new_y]]
                                    path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor+node_gap_1,new_y]]
                                    last_y_by_pid[pid_in_group] = new_y
                                })
                                // x_cursor += 0.5 * node_gap_1

                                //node cx
                                node_set.push([x_cursor, branch_y, group_by_param[Object.keys([group_by_param][0])][1], group_by_param[param_keys[0]][0]])

                                x_cursor += node_gap_1
                            }

                        })
  
                        //after block control points
                        if(paths_without_bb.length==0){ //all link together
                            let total_width = path_width * paths_with_bb.length
                            let start_y = center_y - 0.5 * total_width
                            paths_with_bb.forEach((pid_in_group,p_idx)=>{
                                let y = start_y + (p_idx + 0.5) * path_width
                                // path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor,y]]
                                // last_y_by_pid[pid_in_group] = y
                            })
                        }else{
                            let total_width = path_width * paths_with_bb.length
                            let sub_center_y = 0.5 * (y_scale(paths_with_bb[0]) + y_scale_sub(paths_with_bb[with_count-1]))
                            let start_y = sub_center_y - 0.5 * total_width
                            paths_with_bb.forEach((pid_in_group,p_idx)=>{
                                let y = start_y + (p_idx + 0.5) * path_width
                                // path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor,y]]
                                // last_y_by_pid[pid_in_group] = y
                            })
                            branch_y = sub_center_y
                            //for without bb
                            let total_width2 = path_width * paths_without_bb.length
                            let sub_center_y2 = 0.5 * (y_scale(paths_without_bb[0]) + y_scale_sub(paths_without_bb[without_count-1]))
                            if(Math.abs(sub_center_y2-sub_center_y)<y_gap){
                                    if(sub_center_y>y_scale_sub((group_len-1)/2)){
                                        sub_center_y2 = y_scale_sub(0)
                                    }else{
                                        sub_center_y2 = y_scale_sub(group_len-1)
                                    }
                                }
                            let start_y2 = sub_center_y2 - 0.5 * total_width2
                            paths_without_bb.forEach((pid_in_group,p_idx)=>{
                                let y = start_y2 + (p_idx + 0.5) * path_width
                                path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor,y]]
                                last_y_by_pid[pid_in_group] = y
                            })
                
                        }

                        x_cursor += block_inner_gap
                        block_x_range[1] = x_cursor
                        final_data[i]['x_range'] = block_x_range
                        final_data[i]['y_range'] = block_y_range
                    }
                    x_cursor += block_gap

                    group_ids.forEach((pid_in_group,p_idx)=>{
                        path_set[pid_in_group] = [...path_set[pid_in_group],[x_cursor,y_scale_sub(p_idx)]]
                    })

                    let x_scale_sub = d3.scaleLinear().domain([0,x_cursor]).range([start,right])
                    //draw block background
                    Object.keys(final_data).forEach(key=>{
                        let block_info = final_data[key]
                        let x_range = block_info['x_range']
                        let y_range = block_info['y_range']
                        let x = x_scale_sub(x_range[0])
                        let width = x_scale_sub(x_range[1]) - x
                        let y = y_range[0]
                        let height = y_range[1] - y
                        overview_G.append('rect')
                                    .attr('x',x).attr('y',y).attr('width',width).attr('height',height)
                                    .attr('fill','#dfe4ea').attr('rx',5).attr('ry',5)

                    })

                    let line = d3.line()
                                    .x(d=>x_scale_sub(d[0]))
                                    .y(d=>d[1])
                                    .curve(d3.curveBumpX)
                    let loop_line = d3.line()
                                    .x(d=>d[0])
                                    .y(d=>d[1])
                                    .curve(d3.curveBumpX)

                    group_ids.forEach(pid_in_group=>{
                        let points = path_set[pid_in_group]
                        let path_d = line(points)
                        overview_G.append("path")
                            .data([points])
                            .attr("fill", "none")
                            .attr("stroke", that.actColor['PATHLINE'])
                            .attr("stroke-width", path_width)
                            .attr("d", line);
                    })
                    //features
                    let caller = []
                    let payinvestor = []
                    let loops = new Set()
                    group_ids.forEach(pid_in_group=>{
                        let real_pid = paths[pid_in_group][0]
                        let features = Paths_Data[real_pid]['features']
                        if('loop_range' in Paths_Data[real_pid]){
                            let loops_by_path = Paths_Data[real_pid]['loop_range']
                            loops_by_path.forEach(loop=>{
                                loops.add(JSON.stringify([loop[0],loop[loop.length-1]]))
                            })
                        }
                        caller = [...caller,...features['write_caller']]
                        payinvestor = [...payinvestor,...features['payinvestor']]
                    })
                    // console.log(loops)
                    loops = Array.from(loops.values())
                    loops.forEach(item=>{
                        let range = JSON.parse(item)
                        console.log(range)
                        let start_idx = [...longest_sequence].indexOf(range[0])
                        let end_idx = [...longest_sequence].indexOf(range[1])
                        let seq = [...longest_sequence].slice(start_idx,end_idx+1)
                        console.log(seq)
                        let wrap_gap = 4
                        let forward_points = []
                        let backward_points = []
                        let start_loc = []
                        let end_loc = []
                        for(let k=start_idx;k<=end_idx;k++){
                            let x_range = final_data[k]['x_range']
                            let y_range = final_data[k]['y_range']
                            console.log(x_range,y_range)
                            if(k==start_idx){
                                // forward_points.push([x_scale_sub(x_range[0])-wrap_gap,y_range[1]+wrap_gap-2])
                                // forward_points.push([x_scale_sub(x_range[0])-wrap_gap,y_range[0]-wrap_gap])

                                backward_points.push([x_scale_sub(x_range[0])+wrap_gap,y_range[1]+wrap_gap *2])
                                backward_points.push([x_scale_sub(x_range[0])- wrap_gap,y_range[1]+wrap_gap])

                                start_loc = [x_range[0],...y_range]
                            }
                            forward_points.push([x_scale_sub(x_range[0])+wrap_gap,y_range[0]-wrap_gap])
                            forward_points.push([x_scale_sub(x_range[1])-wrap_gap,y_range[0]-wrap_gap])

                            backward_points.push([x_scale_sub(x_range[0])+wrap_gap,y_range[1]+wrap_gap])
                            backward_points.push([x_scale_sub(x_range[1])-wrap_gap,y_range[1]+wrap_gap])

                            if(k==end_idx){
                                forward_points.push([x_scale_sub(x_range[1])+wrap_gap,y_range[0]-wrap_gap])
                                forward_points.push([x_scale_sub(x_range[1])-wrap_gap,y_range[0]-wrap_gap*2])

                                // backward_points.push([x_scale_sub(x_range[1])+wrap_gap,y_range[1]+wrap_gap])
                                // backward_points.push([x_scale_sub(x_range[1])+wrap_gap,y_range[0]-wrap_gap + 2])

                                end_loc = [x_range[1],...y_range]
                            }
                        }
                        console.log(forward_points);
                        overview_G.append("path")
                            .data([backward_points])
                            .attr("fill", "none")
                            .attr("stroke", '#9b8ea9')
                            .attr("stroke-width", 1)
                            .attr("d", d=>{
                                return `${loop_line(d)}  
                                Q${x_scale_sub(end_loc[0])+wrap_gap} ${end_loc[2]+wrap_gap}, ${x_scale_sub(end_loc[0])+wrap_gap} ${end_loc[2]-wrap_gap}
                                V${end_loc[1]-0.5*wrap_gap}`
                            })
                        overview_G.append("path")
                            .data([forward_points])
                            .attr("fill", "none")
                            .attr("stroke", '#9b8ea9')
                            .attr("stroke-width", 1)
                            .attr("d",d=> {
                                return `M${x_scale_sub(start_loc[0])-wrap_gap} ${start_loc[2]+0.5*wrap_gap} V${start_loc[1]+wrap_gap}
                                Q${x_scale_sub(start_loc[0])-wrap_gap} ${start_loc[1]-wrap_gap}, ${x_scale_sub(start_loc[0])+wrap_gap} ${start_loc[1]-wrap_gap} 
                                 ${loop_line(d)}`
                            })
                    })
                    //calller
                    node_set.filter(item=>caller.includes(item[2])).forEach(node=>{
                        let act = node[2]
                        overview_G.append('circle')
                            .attr('cx',x_scale_sub(node[0])).attr('cy',node[1])
                            .attr('r',6).attr('fill','none')
                            .attr('stroke','black').attr('stroke-width',1)
                    })
                    //pay
                    node_set.filter(item=>payinvestor.map(item=>item[0]).includes(item[2])).forEach(node=>{
                        let sets = payinvestor.filter(n=>n[0].toString()==node[2].toString())
                        let results = node_set.filter(n=> [].concat(...[...sets].map(i=>i[2])).includes(n[2]))
                        let node1_block = node[2][1]
                        let node1_index = longest_sequence.indexOf(node1_block)

                        results.forEach((res_node,res_idx)=>{
                            let node2_block = res_node[2][1]
                            let node2_index = longest_sequence.indexOf(node2_block)


                            let d = `M${x_scale_sub(res_node[0])} ${res_node[1]-6} V${y_scale_sub(-0.5)} H${x_scale_sub(node[0])} V${node[1]-6} `
                            if(y_scale_sub(group_len)==y_scale_sub(0)){
                                d = `M${x_scale_sub(res_node[0])} ${res_node[1]-6} V${y_scale_sub(group_len)-y_scale(1)+y_scale(0)} H${x_scale_sub(node[0])} V${node[1]-6} `
                            }
                            console.log(d)
                            overview_G.append('path')
                                    .attr('d',d)
                                    .attr('fill','none')
                                    .attr('stroke','black').attr("stroke-width",1)
                        })

                    })
                    console.log(caller,payinvestor)
                    //draw circle
                    console.log(node_set)
                    // node_set.forEach(node=>{
                    //     let act = node[2]
                    //     overview_G.append('circle')
                    //         .attr('cx',x_scale_sub(node[0])).attr('cy',node[1])
                    //         .attr('r',3).attr('fill',that.actColor[act[0]])
                    //         .attr('stroke','white').attr('stroke-width',1)
                    // })
                    //draw nodes
                    node_set.forEach(node=>{
                        let act = node[2]
                        
                        if(act[0]=='PAY'){
                            overview_G.append('circle')
                                .attr('cx',x_scale_sub(node[0])).attr('cy',node[1])
                                .attr('r',6).attr('fill','none')
                                .attr('stroke','black').attr('stroke-width',1)
                        }

                        overview_G.append('circle')
                            .attr('cx',x_scale_sub(node[0])).attr('cy',node[1])
                            .attr('r',3).attr('fill',that.actColor[act[0]])
                            .attr('stroke','white').attr('stroke-width',1)
                                .on("mouseover",function(_event){
                                        that.hover_act(_event,act,[x_scale_sub(node[0]),node[1]])
                                    })
                                .on("mouseout",function(_event){
                                        that.out_act()
                                    })
                                .on("click",function(_event){
                                        that.add_path(group_name,node[3].map(n=>paths[n][0]))
                                    })
                    })
                    console.log(final_data)
                    //end of each sub group
                })


                //end of each group
            })
        },
        add_path(group_name,paths_set){
            console.log(group_name,paths_set)
            let now_selected_group = this.selected_group_paths
            let same_group = now_selected_group.filter(item=>item[0]==group_name.toString())
            if(same_group.length>0){//已经有了这个组
                let without_this_group = [...now_selected_group].filter(item=>item[0]!=group_name.toString())
                if(same_group[0][1].length>0){//paths selected >0
                    let now_selected_paths = same_group[0][1]
                    let new_set = [...now_selected_paths].filter(item=>paths_set.includes(item))
                    if(new_set.length>0){//有交集
                        let new_results = [...without_this_group,[group_name,new_set]]
                        this.selected_group_paths = new_results
                    }else{//没有交集
                        let new_results = [...without_this_group,[group_name,paths_set]]
                        this.selected_group_paths = new_results
                    }
                }else{
                    let new_results = [...without_this_group,[group_name,paths_set]]
                    this.selected_group_paths = new_results
                }
            }else{//没有这个组
                this.selected_group_paths = [...this.selected_group_paths,[group_name,paths_set]]
            }
            console.log(this.selected_group_paths)
        },
        remove_group(group_name){
            this.selected_group_paths = [...this.selected_group_paths].filter(item=>item[0]!=group_name.toString())
            this.selected_group_loc = [...this.selected_group_loc].filter(item=>item[0]!=group_name.toString())
        },
        // drawMergePath(svg,start_parts,groups,Paths_Data,start,width){
        //     console.log(start_parts,groups,Paths_Data)
        //     //remove g
        //     let that = this
        //     d3.select('g.overview_G').remove()

        //     let right = that.svgWidth - that.margin.right
        //     let overview_G = svg.append('g').classed('overview_G',true)

        //     let group_ids = Object.keys(start_parts)

            
        //     //each group
        //     group_ids.forEach(item=>{
        //         let location = start_parts[item]
        //         let paths = [...groups[item]].sort((a,b)=>{ //sorted paths
        //             for(let i=0;i<a[1].length;i++){
        //                 let res = b[1][i] - a[1][i]
        //                 if(res!=0){
        //                     return res
        //                 }
        //             }
        //         })
        //         console.log(location,paths)

        //         let y_scale = d3.scaleLinear().domain([-1,paths.length]).range([location[1],location[1]+location[2]])
        //         let y_gap = y_scale(1)-y_scale(0)
        //         that.r = 0.4*y_gap>5?5:0.4*y_gap
        //         let combine_bb_visited = []
        //         paths.forEach((item,idx)=>{
        //             let pid = item[0]
        //             let p_data = Paths_Data[pid]
        //             let actions = p_data['sorted_actions']
        //             // console.log(p_data['path'])
        //             if(p_data['loop'].length>0){ // have loop
        //                 let none_loop_segments = p_data['none_loop_segments']
        //                 let loop_segments = p_data['loop_segments']
        //                 actions = none_loop_segments[0][4]
        //                 let loop_range = []
        //                 let cursor = actions.length
        //                 for(let i=0;i<none_loop_segments.length-1;i++){
        //                     let loop_data = loop_segments.filter(item=>item[0]==i)[0]
        //                     // console.log(loop_data)
        //                     let start = cursor
        //                     actions = [...actions,...loop_data[4],...none_loop_segments[i+1][4]]
        //                     cursor = actions.length 
        //                     loop_range.push([start,start+loop_data[4].length])
        //                 }
        //                 // console.log(actions,loop_range)
        //                 Paths_Data[pid]['sorted_actions'] = actions
        //             }
        //             let bb_visited = []
        //             actions.forEach(act=>{
        //                 if(!bb_visited.includes(act[1])){
        //                     bb_visited.push(act[1])
        //                 }
        //             })
        //             combine_bb_visited.push(bb_visited)
        //             // console.log(bb_visited)
        //         })


        //         // divide paths in one group by same bb
        //         // console.log(combine_bb_visited)
        //         let sub_groups = []
        //         let now_set = new Set(combine_bb_visited[0])
        //         let now_group = []
        //         let now_overlap_bbs = new Set()
        //         let merge_degree = 5
        //         combine_bb_visited.forEach((bbs,idx)=>{
        //             console.log(`path:${idx}`,bbs)
        //             let set = new Set(bbs)
        //             let intersection = new Set([...set].filter(item=>now_set.has(item)))
        //             let anti_intersection = new Set([...now_set].filter(item=>set.has(item)))
        //             let union = new Set([...set,...now_set])
        //             let UminusI = new Set([...union].filter(item=>!intersection.has(item)))
        //             let check1 = [...UminusI].length<merge_degree
        //             let check2 = [...intersection].length>0
        //             let check3 = true
        //             for(let i=1;i<[...intersection].length;i++){
        //                 let idx1 = [...now_set].indexOf([...intersection][i-1])
        //                 let idx2 = [...now_set].indexOf([...intersection][i])
        //                 if(idx1>idx2){
        //                     check3 = false
        //                 }
        //             }
        //             // if([...UminusI].length<merge_degree && [...intersection].length>0 && [...intersection].toString()==[...anti_intersection].toString()){ // check whether need merge
        //             if(check1 && check2){
        //             // if(check1 && check2 && check3){ // check whether need merge  
        //                 // console.log(UminusI,intersection)
        //                 if(now_group.length>0){
        //                     now_overlap_bbs = new Set([...now_overlap_bbs,...intersection])
        //                 }
        //                 now_group.push(idx)
        //                 // console.log(now_group)
        //                 now_set = union
        //             }else{
        //                 sub_groups.push([now_group,now_overlap_bbs])
        //                 now_set = set
        //                 now_group = [idx]
        //                 now_overlap_bbs = []
        //             }
        //         })
        //         sub_groups.push([now_group,now_overlap_bbs])
        //         // console.log(sub_groups)


        //         //deal witl each subgroup that can be merged
        //         let inter_loc_by_group = {}
        //         sub_groups.forEach((item,sub_groups_idx)=>{//one subgroup
        //             let path_ids = item[0]
        //             let intersection_set = item[1]
        //             let p_count = path_ids.length
        //             console.log(intersection_set)

        //             if(p_count>1){//if more than one paths in the subgroup
        //                 let max_len = Math.max(...path_ids.map(item=>combine_bb_visited[item].length))
        //                 let max_index = path_ids.map(item=>combine_bb_visited[item].length).indexOf(max_len)
        //                 console.log(max_index,max_len)
        //                 let initial_seq = combine_bb_visited[path_ids[max_index]]
        //                 console.log([...initial_seq])
        //                 let last_bb = 0
        //                 path_ids.forEach((pid_in_group,pid_in_sub)=>{
        //                     let bb_list = combine_bb_visited[pid_in_group]
        //                     let not_include = []
        //                     // console.log(bb_list)
        //                     bb_list.forEach(bb=>{
        //                         if(!initial_seq.includes(bb)){
        //                             not_include =  JSON.parse(JSON.stringify(not_include)).push(bb)
        //                         }else{
        //                             if(not_include.length>0){
        //                                 let index = initial_seq.indexOf(bb)
        //                                 console.log(initial_seq)
                                        
        //                                 initial_seq = JSON.parse(JSON.stringify(initial_seq)).splice(index-1,0,JSON.parse(JSON.stringify(not_include)))
        //                                 console.log(initial_seq)
        //                                 not_include = []
        //                             }
        //                         }
        //                     })
        //                     if(not_include.length>0){
        //                         initial_seq = [...initial_seq,...not_include]
        //                     }
        //                 })
        //                 console.log(initial_seq)
        //                 initial_seq = [...initial_seq].filter(item=>[...intersection_set].includes(item))
        //                 console.log(initial_seq)
        //                 let path_cursors = {}
        //                 let x_cursor = 0
        //                 let path_left = {}
        //                 let inter_loc = {}
        //                 let inter_stat = {}
        //                 let unionSets = {}
        //                 initial_seq.forEach((bb,bb_idx)=>{//each intersect node
        //                     let before_len = 0
        //                     let max_len = 0
        //                     let bb_stat = []
        //                     let union_set = new Set()
        //                     path_ids.forEach((pid_in_group,pid_in_sub)=>{ //each path
        //                         let pid = paths[pid_in_group][0]
        //                         let p_data = Paths_Data[pid]
        //                         let actions = p_data['sorted_actions']
        //                         // console.log(pid,p_data)
        //                         let bb_list = []
        //                         if(pid_in_group in path_left){
        //                             bb_list = path_left[pid_in_group]
        //                         }else{
        //                             path_left[pid_in_group] = combine_bb_visited[pid_in_group]
        //                             bb_list = path_left[pid_in_group]
        //                         }
        //                         // console.log(bb_list)

        //                         // let bb_list = combine_bb_visited[pid_in_group]
        //                         if(bb_list.includes(bb)){
        //                             bb_stat.push([pid_in_group,actions.filter(item=>item[1]==bb)])
        //                             let slice = bb_list.slice(0,bb_list.indexOf(bb)) //slice
        //                             // console.log(slice)
        //                             if(slice.length>0){
        //                                 let len = 0
        //                                 slice.forEach(block=>{
        //                                     let b_actions = actions.filter(item=>item[1]==block)
        //                                     len += b_actions.length
        //                                     // console.log(bb,block,b_actions,len)
        //                                 })
        //                                 before_len = len>before_len?len:before_len
        //                             }else{
                                        
        //                             }
        //                             // console.log(bb_list.indexOf(bb))
        //                             let c_actions = actions.filter(item=>item[1]==bb).map(item=>item[3])
        //                             union_set = new Set([...union_set,...c_actions])
        //                             // max_len = c_actions.length>max_len?c_actions.length:max_len

        //                             path_left[pid_in_group] = [...bb_list].slice(bb_list.indexOf(bb)+1)
        //                         }
        //                     })
        //                     max_len = [...union_set].length
        //                     unionSets[bb] = [...union_set].sort((a,b)=>a-b)
        //                     inter_stat[bb] = bb_stat
        //                     // if(before_len>0){
        //                     //     inter_loc[bb] = [[x_cursor+1,x_cursor+before_len+1],[x_cursor+before_len+1,x_cursor+max_len+before_len+2]]
        //                     //     x_cursor = x_cursor+max_len+before_len+2
        //                     // }else{
        //                     //     inter_loc[bb] = [[x_cursor,x_cursor+before_len],[x_cursor+before_len, x_cursor+max_len+before_len+1]]
        //                     //     x_cursor += max_len + before_len +1
        //                     // }
        //                     inter_loc[bb] = [[x_cursor,x_cursor+before_len],[x_cursor+before_len, x_cursor+max_len+before_len]]
        //                     x_cursor += max_len + before_len
        //                     // console.log(before_len,max_len,x_cursor)

        //                     if(bb_idx==initial_seq.length-1){
        //                         let end_len = 0
        //                         path_ids.forEach((pid_in_group,pid_in_sub)=>{ 
        //                             let pid = paths[pid_in_group][0]
        //                             let p_data = Paths_Data[pid]
        //                             let actions = p_data['sorted_actions']
        //                             let d = path_left[pid_in_group]
        //                             if(d.length>0){
        //                                 let len = 0
        //                                 d.forEach(block=>{
        //                                     let b_actions = actions.filter(item=>item[1]==block)
        //                                     len += b_actions.length
        //                                 })
        //                                 end_len = end_len>len?end_len:len
        //                             }
        //                         })
        //                         inter_loc['end'] = [x_cursor+1,x_cursor+end_len+1]
        //                         x_cursor += end_len + 1
        //                     }
        //                 })
        //                 console.log(inter_loc)
        //                 inter_loc_by_group[sub_groups_idx] = {
        //                     'loc':inter_loc,
        //                     'seq':initial_seq,
        //                     'path_ids':path_ids,
        //                     'len':x_cursor,
        //                     'inter_stat':inter_stat,
        //                     'union_set':unionSets
        //                 }
        //             }
        //         })
        //         console.log(inter_loc_by_group)

        //         //draw the subgroup
        //         sub_groups.forEach((item,sub_groups_idx)=>{
        //             let path_ids = item[0]
        //             let p_count = path_ids.length
        //             let x_cursor = 0
        //             if(p_count>1){//more than one path in the sub group
        //                 let seq = inter_loc_by_group[sub_groups_idx]['seq']
        //                 let loc = inter_loc_by_group[sub_groups_idx]['loc']
        //                 let max_len = inter_loc_by_group[sub_groups_idx]['len']
        //                 let inter_stat = inter_loc_by_group[sub_groups_idx]['inter_stat']
        //                 let union_set = inter_loc_by_group[sub_groups_idx]['union_set']

        //                 // console.log(inter_stat,union_set)
        //                 let x_scale = d3.scaleLinear().domain([-1,max_len]).range([start,right])
        //                 let lines = {} 
        //                 let y_center = 0.5 * (y_scale(parseInt(path_ids[0])) + y_scale(parseInt(path_ids[p_count-1])))
        //                 // console.log(y_center,path_ids[0])
        //                 let path_left = {}
        //                 let node_set = []
        //                 for(let i=0;i<seq.length;i++){
        //                     let bb = seq[i]
        //                     let inter_len = loc[bb][1][1]-loc[bb][1][0]
        //                     let x_idx_by_path = {}
        //                     path_ids.forEach(item=>{
        //                         x_idx_by_path[item] = []
        //                     })
        //                     let union_for_bb = union_set[bb]
        //                     let bb_x_scale0 = d3.scaleLinear().domain([0,loc[bb][0][1]-loc[bb][0][0]]).range([x_scale(loc[bb][0][0]),x_scale(loc[bb][0][1])])
        //                     let bb_x_scale = d3.scaleLinear().domain([0,union_for_bb.length+1]).range([x_scale(loc[bb][1][0]),x_scale(loc[bb][1][1])])
        //                     // console.log(union_for_bb.length)

        //                     //deal with the same bb but different value
        //                     union_for_bb.forEach(pc=>{
        //                         let unique_set = new Set()
        //                         let path_with_act = []
        //                         inter_stat[bb].forEach(item=>{
        //                             let pid_in_group = item[0]
        //                             let actions = item[1]
        //                             // let index_list = actions.map(item=>item[3])
        //                             let act = [...actions].filter(item=>item[3]==pc)
        //                             if(act.length>0){
        //                                 path_with_act.push(pid_in_group)
        //                                 unique_set.add(act[0].slice(4).toString())
        //                             }
        //                         })
        //                         // console.log(path_with_act)
        //                         // console.log(inter_stat[bb].length,unique_set)
        //                         if([...unique_set].length==1){
        //                             path_with_act.forEach(item=>{
        //                                 let pid_in_group = item
        //                                 let now_list =  JSON.parse(JSON.stringify(x_idx_by_path[pid_in_group])) 
        //                                 now_list.push([pc,path_with_act,'only'])
        //                                 x_idx_by_path[pid_in_group] = now_list
        //                             })
        //                         }else{
        //                             [...unique_set].forEach(str=>{
        //                                 let g = [...inter_stat[bb]].filter(item=>item[1].filter(act=>act[3]==pc)[0].slice(4).toString()==str).map(item=>item[0])
        //                                 g.forEach(pid_in_group=>{
        //                                     let now_list = JSON.parse(JSON.stringify(x_idx_by_path[pid_in_group])) 
        //                                     now_list.push([pc,g,path_with_act])
        //                                     x_idx_by_path[pid_in_group] = now_list
        //                                 })
        //                             })
        //                         }
                                
        //                     })
        //                     // console.log(x_idx_by_path)
                            

        //                     let y_center = 0.5 * (y_scale(parseInt(inter_stat[bb][0][0])) + y_scale(parseInt(inter_stat[bb][inter_stat[bb].length-1][0])) ) 
        //                     path_ids.forEach((pid_in_group,pid_in_sub)=>{
        //                         let pid = paths[pid_in_group][0]
        //                         let p_data = Paths_Data[pid]
        //                         let actions = p_data['sorted_actions']

        //                         if(!(pid_in_group in path_left)){
        //                             path_left[pid_in_group] = combine_bb_visited[pid_in_group]
        //                         }
        //                         if(!(pid_in_group in lines)){
        //                             lines[pid_in_group] = [`M${start} ${y_scale(pid_in_group)}`,y_scale(pid_in_group)]
        //                             let first_bb = combine_bb_visited[pid_in_group][0]
        //                             if(seq.includes(first_bb)){
        //                                 lines[pid_in_group] = [`M${start} ${y_scale(pid_in_group)} H${x_scale(loc[first_bb][1][0]-1)}`,y_scale(pid_in_group)]
        //                             }

        //                         }
        //                         let bb_list = path_left[pid_in_group]
        //                         let now_d = lines[pid_in_group][0]
        //                         let last_y = lines[pid_in_group][1]
        //                         if(bb_list.includes(bb)){
        //                             let slice1 = [...bb_list].slice(0,bb_list.indexOf(bb))
        //                             let slice2 = [...bb_list].slice(bb_list.indexOf(bb),bb_list.indexOf(bb))

        //                             if(slice1.length>0){//before inter node
        //                                 //add node in set
        //                                 let x_idx = 0
        //                                 slice1.forEach(block=>{
        //                                     let acts = actions.filter(item=>item[1]==block)
        //                                     acts.forEach(node=>{
        //                                         let x = bb_x_scale0(x_idx+0.25)
        //                                         let y = y_scale(pid_in_group)
        //                                         let node_info = [x,y,node,[pid_in_group]]
        //                                         node_set.push(node_info)
        //                                         x_idx += 1
        //                                     })
        //                                 })
        //                                 //draw line
        //                                 now_d += `C${x_scale(loc[bb][0][0]-0.25)} ${last_y}, ${x_scale(loc[bb][0][0]-0.25)} ${y_scale(pid_in_group)}, ${x_scale(loc[bb][0][0])} ${y_scale(pid_in_group)}`
        //                                 now_d += `L${x_scale(loc[bb][0][1]-0.5)} ${y_scale(pid_in_group)}`
        //                                 last_y = y_scale(pid_in_group)
        //                                 lines[pid_in_group] = [now_d,last_y]
        //                             }
        //                             //for inter nodes
        //                             // console.log(bb,actions)
        //                             // console.log(union_for_bb.length,path_ids.length,x_idx_by_path)
        //                             now_d += `C${x_scale(loc[bb][1][0]-0.25)} ${last_y}, ${x_scale(loc[bb][1][0]-0.25)} ${y_center}, ${x_scale(loc[bb][1][0])} ${y_center}`
        //                             last_y = y_center
        //                             let loc_actions = x_idx_by_path[pid_in_group]
        //                             console.log(loc_actions)
        //                             let core_y = last_y
        //                             loc_actions.forEach((g,g_idx)=>{
        //                                 if(g[2]!='only'){
        //                                     console.log(g)
        //                                     let x0 = bb_x_scale(union_for_bb.indexOf(g[0]))
        //                                     let x1 = bb_x_scale(union_for_bb.indexOf(g[0])+0.25)
        //                                     let x = bb_x_scale(union_for_bb.indexOf(g[0])+0.5)
        //                                     let x2 = bb_x_scale(union_for_bb.indexOf(g[0])+0.75)
        //                                     let x3 = bb_x_scale(union_for_bb.indexOf(g[0])+1)
        //                                     let y = 0.5 * (y_scale(parseInt(g[1][0])) +  y_scale(parseInt(g[1][g[1].length-1])))
        //                                     now_d += `L${x0} ${last_y}`
        //                                     now_d += `C${x1} ${last_y}, ${x1} ${y}, ${x} ${y}`
        //                                     now_d += `C${x2} ${y}, ${x2} ${last_y}, ${x3} ${last_y}`
        //                                     // last_y = y
        //                                     //add node in set
        //                                     let node = actions.filter(item=>item[3]==g[0])[0]
        //                                     node_set.push([x,y,node,g[1]])
        //                                     //end-------

        //                                 }else{
        //                                     now_d += `L${bb_x_scale(union_for_bb.indexOf(g[0])+0.5)} ${y_center}`
        //                                     // last_y = y_center
        //                                     //add node in set
        //                                     let node = actions.filter(item=>item[3]==g[0])[0]
        //                                     node_set.push([bb_x_scale(union_for_bb.indexOf(g[0])+0.5),y_center,node,g[1]])
        //                                     //end-------
        //                                 }
        //                             })
        //                             now_d += `L${x_scale(loc[bb][1][1]-0.5)} ${y_center}`
        //                             last_y = y_center
        //                             lines[pid_in_group] = [now_d,last_y]
        //                             path_left[pid_in_group] = [...bb_list].slice(bb_list.indexOf(bb)+1)
        //                         }
        //                         if(i==seq.length-1){
        //                             if('end' in loc){
        //                                 // console.log(loc['end'])
        //                                 now_d += `C${x_scale(loc['end'][0]-0.5)} ${last_y}, ${x_scale(loc['end'][0]-0.5)} ${y_scale(pid_in_group)}, ${x_scale(loc['end'][0])} ${y_scale(pid_in_group)}`
        //                                 now_d += `L${x_scale(loc['end'][1])} ${y_scale(pid_in_group)}`
        //                                 lines[pid_in_group] = [now_d,last_y]


        //                                 console.log(path_left[pid_in_group])
        //                                 let end_x_scale = d3.scaleLinear().domain([0,loc['end'][1]-loc['end'][0]]).range([x_scale(loc['end'][0]),x_scale(loc['end'][1])])
        //                                 let x_idx = 0
        //                                 path_left[pid_in_group].forEach(block=>{
        //                                     let acts = actions.filter(item=>item[1]==block)
        //                                     acts.forEach(node=>{
        //                                         let x = end_x_scale(x_idx+0.25)
        //                                         let y = y_scale(pid_in_group)
        //                                         let node_info = [x,y,node,[pid_in_group]]
        //                                         node_set.push(node_info)
        //                                         x_idx += 1
        //                                     })
        //                                 })
        //                             }
        //                         }

        //                     })

        //                 }
        //                 Object.keys(lines).forEach(pid_in_group=>{
        //                     // console.log(lines[pid_in_group])
        //                     overview_G.append('path')
        //                         .attr('d',lines[pid_in_group][0]).attr('fill','none')
        //                         // .attr('stroke','black').attr('stroke-width',1)
        //                         .attr('stroke',that.actColor['LINE']).attr('stroke-width',0.7)
        //                 })

        //                 node_set.forEach(node_info=>{
        //                     // console.log(node_info)
        //                     overview_G.append('circle')
        //                         .attr('cx',node_info[0]).attr('cy',node_info[1])
        //                         .attr('r',that.r)
        //                         .attr('fill',that.actColor[node_info[2][0]])
        //                         .attr('stroke','white').attr('stroke-width',0.2*that.r)
        //                             .on("mouseover",function(_event){
        //                                     that.hover_act(_event,node_info[2])
        //                                 })
        //                             .on("mouseout",function(_event){
        //                                     that.out_act()
        //                                 })
        //                             .on('click',function(_event){
        //                                     that.click_path(paths[node_info[3][0]][0])
        //                                 })
        //                 })
                
        //             }else{ // one path is a sub group
        //                 let path_d = `M${start} ${y_scale(path_ids[0])} H${right}`
        //                 overview_G.append('path')
        //                         .attr('d',path_d).attr('fill','none')
        //                         .attr('stroke',that.actColor['LINE']).attr('stroke-width',1)
                        
                        
                        
        //                 let p_data = Paths_Data[path_ids[0]]
        //                 let actions = p_data['sorted_actions']
        //                 let x_scale = d3.scaleLinear().domain([-1,actions.length]).range([start,right])
        //                 actions.forEach((act,idx)=>{
                        
        //                         overview_G.append('circle')
        //                             .attr('cx',x_scale(idx)).attr('cy',y_scale(path_ids[0]))
        //                             .attr('r',that.r)
        //                             .attr('fill',that.actColor[act[0]])
        //                             .attr('stroke','white').attr('stroke-width',0.2*that.r)
        //                                 .on("mouseover",function(_event){
        //                                         that.hover_act(_event,act)
        //                                     })
        //                                 .on("mouseout",function(_event){
        //                                         that.out_act()
        //                                     })
        //                 })
        //                 console.log(path_ids,p_data,actions)
        //             }
        //         })

        //     })

        // },
        // drawFilter(svg,start,end,width,height){
        //     //remove g
        //     let that = this
        //     d3.select('g.filter_G').remove()

        //     let filter_G = svg.append('g').classed("filter_G",true)
        //     //add gradient
        //     let defs = filter_G.append('defs')
        //     let G1 = defs.append('linearGradient')
        //                 .attr("id",'d2l')
        //                 .attr("x1",'0%').attr("y1",'0%').attr("x2",'0%').attr("y2",'100%')
        //     G1.append('stop').attr('offset','0%').attr("style",`stop-color: ${that.actColor['D_FILTER']}`)
        //     G1.append('stop').attr('offset','100%').attr("style",`stop-color:${that.actColor['L_FILTER']}`)
        //     let G2 = defs.append('linearGradient')
        //                 .attr("id",'l2d')
        //                 .attr("x1",'0%').attr("y1",'0%').attr("x2",'0%').attr("y2",'100%')
        //     G2.append('stop').attr('offset','0%').attr("style",`stop-color: ${that.actColor['L_FILTER']}`)
        //     G2.append('stop').attr('offset','100%').attr("style",`stop-color:${that.actColor['D_FILTER']}`)
        
            
        //     let groups = this.groups
        //     console.log(groups)
        //     let groups_id = Object.keys(groups)

        //     let sorted_groups_id = [...groups_id].sort((a,b)=>{
        //             let new_a = a.split(',').map(item=>parseInt(item))
        //             let new_b = b.split(',').map(item=>parseInt(item))
        //             for(let i=0;i<new_a.length;i++){
        //                 let res = new_b[i] - new_a[i]
        //                 if(res!=0){
        //                     return res
        //                 }
        //             }
        //     })
        //     console.log(sorted_groups_id)
        //     let label_len = Object.keys(that.label_idx).length
        //     let group_len = groups_id.length
        //     let y_scale = d3.scaleLinear().domain([-1,label_len]).range([end,start])


        //     let path_count = d3.sum([...groups_id].map(item=>groups[item].length))
        //     let gap1 = 0.02 * path_count/group_len
        //     let gap2 = gap1 * 10
        //     let path_width = 1

        //     console.log(path_count)
        //     let total_width = path_count + gap2 + group_len * gap1 * 2
        //     let x_scale = d3.scaleLinear().domain([0,total_width]).range([that.margin.left,that.margin.left+width])
        //     let x_gap = x_scale(1)-x_scale(0)
        //     let f_height = 5
        //     let inner_gap = f_height*0.1
        //     //draw filter
        //     let last_parts = {}
        //     let start_parts = {}
        //     for(let j=0;j<label_len;j++){
        //         let y = y_scale(j)
        //         let x_cursor = 0
        //         let left_part = sorted_groups_id.filter(item=>{
        //             return item.split(',').map(item=>parseInt(item))[j] == 1
        //         })
        //         let right_part = sorted_groups_id.filter(item=>{
        //             return item.split(',').map(item=>parseInt(item))[j] == 0
        //         })
        //         console.log(left_part,right_part)
        //         left_part.forEach(item=>{
        //             let path_num = groups[item].length
        //             let group_width = path_width*path_num
        //             x_cursor += gap1
        //             let x = x_scale(x_cursor)
        //             let w = group_width*x_gap
        //             if(j>0){
        //                 let p_data = last_parts[item]
        //                 let p_d = `M${p_data[0]+inner_gap} ${p_data[1]+p_data[3]} L${x+inner_gap} ${y+f_height} h${w-2*inner_gap} L${p_data[0]+p_data[2]-inner_gap} ${p_data[1]+p_data[3]} z`
        //                 let fill_color = that.actColor['D_FILTER']
        //                 if(p_data[4]==0){
        //                     fill_color = `url(#${'d2l'})`
        //                 }
        //                 filter_G.append('path')
        //                     .attr('d',p_d).attr('fill',fill_color).attr('stroke',that.actColor['L_FILTER'])
        //                     .attr('opacity',0.5)
        //             }
        //             filter_G.append('rect')
        //                 .attr('x',x).attr('y',y).attr('width',w).attr('height',f_height)
        //                 .attr('rx',f_height*0.1).attr('ry',f_height*0.1)
        //                 .attr('stroke',that.actColor['D_FILTER']).attr('stroke-width',1)
        //                 .attr('fill',that.actColor['D_FILTER'])
        //             last_parts[item] = [x,y-f_height,w,f_height,1]
        //             x_cursor += gap1 + group_width
        //         })
        //         x_cursor += gap2
        //         right_part.forEach(item=>{
        //             let path_num = groups[item].length
        //             let group_width = path_width*path_num
        //             x_cursor += gap1
        //             let x = x_scale(x_cursor)
        //             let w = group_width*x_gap
        //             if(j>0){
        //                 console.log(last_parts[item])
        //                 let p_data = last_parts[item]
        //                 let p_d = `M${p_data[0]+inner_gap} ${p_data[1]+p_data[3]} L${x+inner_gap} ${y+f_height} h${w-2*inner_gap} L${p_data[0]+p_data[2]-inner_gap} ${p_data[1]+p_data[3]} z`
        //                 let fill_color = that.actColor['L_FILTER']
        //                 if(p_data[4]==1){
        //                     fill_color = `url(#${'l2d'})`
        //                 }
        //                 filter_G.append('path')
        //                     .attr('d',p_d).attr('fill',fill_color).attr('stroke',that.actColor['L_FILTER'])
        //                     .attr('opacity',0.5)
        //             }
        //             filter_G.append('rect')
        //                 .attr('x',x).attr('y',y).attr('width',w).attr('height',f_height)
        //                 .attr('rx',f_height*0.1).attr('ry',f_height*0.1)
        //                 .attr('stroke',that.actColor['D_FILTER']).attr('stroke-width',1)
        //                 .attr('fill',that.actColor['L_FILTER'])
        //             last_parts[item] = [x,y-f_height,w,f_height,0]
        //             x_cursor += gap1 + group_width
        //         })
        //         console.log(j)
        //         if(j==0){
        //             console.log(j,last_parts)
        //             start_parts = JSON.parse(JSON.stringify(last_parts));

        //             // Object.keys(start_parts).forEach(item=>{
        //             //     filter_G.append('rect')
        //             //         .attr('x',start_parts[item][0]).attr('y',start_parts[item][1]+start_parts[item][3]*2)
        //             //                 .attr('width',start_parts[item][2]).attr('height',that.svgHeight - that.margin.bottom -(start_parts[item][1]+start_parts[item][3]*2))
        //             //                 .attr('rx',f_height*0.1).attr('ry',f_height*0.1)
        //             //                 .attr('fill',that.actColor['LINE'])
        //             // })
        //         }
        //     }
            
        //     Object.keys(that.label_idx).forEach((item,idx)=>{
        //         let content = item
        //         filter_G.append('text')
        //             .attr('x',x_scale(0)).attr('y',y_scale(that.label_idx[item])-f_height)
        //             .attr('text-anchor','start').attr('dominant-baseline','top')
        //             .attr('font-family','Arial').attr('font-weight','bold')
        //             .attr('font-size',10)
        //             .text(content)
        //     })


        //     that.drawPaths2(svg,start_parts,groups,this.Paths_Data,end,height)

        // },
        drawPaths2(svg,start_parts,groups,Paths_Data,start,width){
            console.log(start_parts,groups,Paths_Data)
            //remove g
            let that = this
            d3.select('g.overview_G').remove()

            let right = that.svgWidth - that.margin.right
            let overview_G = svg.append('g').classed('overview_G',true)

            let group_ids = Object.keys(start_parts)

            //each group
            group_ids.forEach(item=>{
                let location = start_parts[item]
                let paths = [...groups[item]].sort((a,b)=>{ //sorted paths
                    for(let i=0;i<a[1].length;i++){
                        let res = b[1][i] - a[1][i]
                        if(res!=0){
                            return res
                        }
                    }
                })
                console.log(location,paths)

                let y_scale = d3.scaleLinear().domain([-1,paths.length]).range([location[1],location[1]+location[2]])
                paths.forEach((item,idx)=>{
                    let p_G = overview_G.append('g')
                    let p_data = Paths_Data[item[0]]
                    p_G.append('line')
                        .attr("x1",start+2).attr("y1",y_scale(idx))
                        .attr("x2",right).attr("y2",y_scale(idx))
                        .attr("stroke",that.actColor['LINE']).attr("stroke-width",that.actSize['LINE'])
                        // .attr("stroke",'black').attr("stroke-width",that.actSize['LINE'])

                    if(p_data['loop'].length>0){ // have loop
                        let none_loop_segments = p_data['none_loop_segments']
                        let loop_segments = p_data['loop_segments']
                        let actions = none_loop_segments[0][4]
                        // console.log(actions)
                        let loop_range = []
                        let cursor = actions.length
                        for(let i=0;i<none_loop_segments.length-1;i++){
                            let loop_data = loop_segments.filter(item=>item[0]==i)[0]
                            // console.log(loop_data)
                            let start = cursor
                            actions = [...actions,...loop_data[4],...none_loop_segments[i+1][4]]
                            cursor = actions.length 
                            loop_range.push([start,start+loop_data[4].length])
                        }
                        // console.log(actions,loop_range)
                        let x_scale =  d3.scaleLinear().domain([-1,actions.length]).range([start,right])
                        let y_gap = y_scale(1)-y_scale(0)
                        let gap_rate = 0.1
                        loop_range.forEach(item=>{
                            let l_width = y_gap*(1-gap_rate*2)
                            p_G.append('rect')
                                .attr('y',y_scale(idx-0.5)+gap_rate*y_gap).attr('x',x_scale(item[0]-0.5))
                                .attr('height',l_width).attr('width',x_scale(item[1])-x_scale(item[0]))
                                .attr('rx',l_width/2).attr('ry',l_width/2)
                                .attr('fill',that.actColor['LINE'])
                                // .attr('stroke','black')
                        })

                        actions.forEach((act,act_idx)=>{
                            p_G.append('circle')
                                .attr('cy',y_scale(idx))
                                .attr('cx',x_scale(act_idx))
                                .attr('r',that.actSize[act[0]])
                                .attr("fill",that.actColor[act[0]])
                                .attr("stroke",that.actColor['STROKE'])
                                .attr('stroke-width',that.actSize['STROKE'])
                                    .on("mouseover",function(_event){
                                        that.hover_act(_event,act)
                                    }).on("mouseout",function(_event){
                                        that.out_act()
                                    })
                        })
                        p_G.on('click',function(_event){
                                        that.click_path(item[0])
                                    })

                    }else{// no loop
                        let actions = p_data['sorted_actions']
                        let x_scale =  d3.scaleLinear().domain([-1,actions.length]).range([start,right])
                        actions.forEach((act,act_idx)=>{
                            overview_G.append('circle')
                                .attr('cx',x_scale(act_idx))
                                .attr('cy',y_scale(idx))
                                .attr('r',that.actSize[act[0]])
                                .attr("fill",that.actColor[act[0]])
                                .attr("stroke",that.actColor['STROKE'])
                                .attr('stroke-width',that.actSize['STROKE'])
                                    .on("mouseover",function(_event){
                                        that.hover_act(_event,act)
                                    }).on("mouseout",function(_event){
                                        that.out_act()
                                    }).on('click',function(_event){
                                        that.click_path(item[0])
                                    })
                        })
                    }


                })
            })
        },
        drawPaths(svg,data,that,width,height,start){
            //remove g
            d3.select('g.path_G').remove()

            let path_G = svg.append('g').classed("path_G",true)
            
            let paths = Object.keys(data).slice(0,-1)
            let storage = data['storage']
            let x_scale = d3.scaleLinear().domain([-1,paths.length]).range([that.margin.left,that.margin.left+width])

            paths.forEach( (path,idx) => {
                let p_data = data[path]
                let sorted_actions = p_data['sortedActions']
                let p_G = path_G.append('g').classed('p_G',true)
                let y_scale = d3.scaleLinear().domain([-2,sorted_actions.length+1]).range([start,that.margin.top+height])

                    
                p_G.append('line').classed('act',true)
                    .attr("x1",x_scale(idx)).attr("y1",start)
                    .attr("x2",x_scale(idx)).attr("y2",that.margin.top+height)
                    .attr("stroke",that.actColor['LINE']).attr("stroke-width",that.actSize['LINE'])

                sorted_actions.forEach((d,i)=>{
                    p_G.append('circle')
                        .classed('act',true)
                            .attr('cx',x_scale(idx))
                            .attr('cy',y_scale(i))
                            .attr('r',that.actSize[d[0]])
                            .attr("fill",that.actColor[d[0]])
                            .attr("stroke",that.actColor['STROKE'])
                            .attr('stroke-width',that.actSize['STROKE'])
                                .on("mouseover",function(_event){
                                    that.hover_act(_event,d,[x_scale(idx),y_scale(i)])
                                }).on("mouseout",function(_event){
                                    that.out_act()
                                })
                    if(d[d.length-1]=='callback' | d[d.length-1]=='update' ){
                        p_G.append('circle')
                            .attr('cx',x_scale(idx))
                                .attr('cy',y_scale(i))
                                .attr('r',that.actSize[d[0]]-2*that.actSize['STROKE'])
                                .attr("fill",'none')
                                .attr("stroke",that.actColor['STROKE'])
                                .attr('stroke-width',that.actSize['STROKE'])
                    }
                })
                //click function
                p_G.on('click',function(_event){
                                that.click_path(idx)
                            })
            })
        },        
        //click the path
        click_path(idx){
            this.$emit("update_selected_path", idx);
            this.$emit("update_selected_path_data", this.Paths_Data[idx]);
        },
        // hover the action show the details
        hover_act(_event,d,loc){
            let res = d3.pointer(_event)
            d3.select('div.tooltip_path').select('p').remove()
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
            d3.select('div.tooltip_path').append("p").html(text.join("<br>"))
            d3.select('div.tooltip_path').attr('style',`transform:translate(${parseInt(loc[0])+20}px,${parseInt(loc[1])-20}px);visibility:visible;z-index:2`)
        },
        // mouse out from the action
        out_act(){
            d3.select('div.tooltip_path').attr('style',`visibility:hidden`)
        },
    },
    created(){
    },
    mounted(){
        window.addEventListener("resize",this.setSvg);
        //initial
        let that = this
        let data = that.actions //raw data 
        this.dataInit(data)

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
    /* font-size: 1.6em; */
    /* font-weight: bolder; */
    /* font-family: 'Metropolis'; */
}
.view_title {
  color: #606e79;
  /* font-weight: bolder; */
}
.selection {
    fill: #775039;
    stroke:black;
    stroke-width:1;
    opacity: 1;
    rx:2px;
    ry:2px;
}
.handle {
    fill: none; 
    width:10px;
    height:2px;
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
.tooltip_path {
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