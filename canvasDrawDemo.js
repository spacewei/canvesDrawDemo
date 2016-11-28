/**
 * Created by SPACEY on 2016/11/26.
 */
var main = (function(){
    /***参数***/
    //canvas宽高参数
    var canvasW = 400;
    var canvasH = canvasW;
    //默认画线线宽
    var lineWidthDefault = 5;
    //默认线条颜色(紫色)
    var lineColorDefault = 'violet';
    /*全局变量*/
    //画线的线宽
    var lineWidth = lineWidthDefault;
    //画线的颜色
    var lineColor = lineColorDefault;
    //运笔速度计算出的动态线宽
    var lineWidthDynamic = lineWidth;
    //上面动态线宽中上一点的线宽
    var lineWidthOrigin = -1;
    //鼠标是否按下
    var isMouseDown = false;
    /******/
    /***分立函数***/
    /*绘制米字格*/
    var drawGrid = function(canvas){
        canvas.beginPath();
        canvas.moveTo(3,3);
        canvas.lineTo(canvasW-3,3);
        canvas.lineTo(canvasW-3,canvasH-3);
        canvas.lineTo(3,canvasH-3);
        canvas.closePath();
        canvas.lineWidth = 5;
        canvas.strokeStyle = 'red';
        canvas.stroke();
        //绘制米字格交叉虚框
        var originPoint = [0,0];
        dashLineDraw(canvas,originPoint,0);
        originPoint = [0,canvasH];
        dashLineDraw(canvas,originPoint,1);
        originPoint = [0,canvasH/2];
        dashLineDraw(canvas,originPoint,2);
        originPoint = [canvasW/2,0];
        dashLineDraw(canvas,originPoint,3);
    };
    /*绘制米字格交叉虚线*/
    var dashLineDraw = function(canvas,originPoint,y){
        var presentPoint = [];
        var gap = 4;
        for(var i=1;i<=canvasW-2;i++){
            if(i%3 == 0){
                switch (y){
                    case 0:
                        presentPoint = [i,i];
                        break;
                    case 1:
                        presentPoint = [i,canvasH - i];
                        break;
                    case 2:
                        presentPoint[0] = i;
                        presentPoint[1] = canvasH/2;
                        break;
                    case 3:
                        presentPoint[0] = canvasW/2;
                        presentPoint[1] = i;
                        break;
                }
                canvas.beginPath();
                canvas.moveTo(originPoint[0],originPoint[1]);
                canvas.lineTo(presentPoint[0],presentPoint[1]);
                canvas.closePath();
                canvas.lineWidth = 2;
                canvas.strokeStyle = 'red';
                canvas.stroke();
                switch (y){
                    case 0:
                        originPoint[0] = i + gap;
                        originPoint[1] = i + gap;
                        break;
                    case 1:
                        originPoint[0] = i + gap;
                        originPoint[1] = canvasH - i - gap;
                        break;
                    case 2:
                        originPoint[0] = i + gap;
                        break;
                    case 3:
                        originPoint[1] = i + gap;
                        break;
                }
            }
        }
    };
    /*坐标系变换*/
    var coordinateChange = function(canvasDom,x,y){
        var bbox = canvasDom.getBoundingClientRect();
        var X = Math.round(x - bbox.left);
        var Y = Math.round(y - bbox.top);
        return {x:X,y:Y};
    };
    /*绘画主程序*/
    var drawF = function(canvasDom,canvasJQ,canvas){
        //起笔点
        var moveToP;
        //落笔点
        var lineToP;
        //起笔时间
        var moveToTime;
        //鼠标点击监听:记录落笔的时空信息,lineWidthOrigin重置
        canvasJQ.on('mousedown',function(e){
            e.preventDefault();
            isMouseDown = true;
            moveToP = coordinateChange(canvasDom, e.clientX, e.clientY);
            moveToTime = new Date().getTime();
            lineWidthOrigin = -1;
        });
        //鼠标松开按键监听
        canvasJQ.on('mouseup',function(e){
            e.preventDefault();
            isMouseDown = false;
        });
        //鼠标离开canvas监听
        canvasJQ.on('mouseout',function(e){
            e.preventDefault();
            isMouseDown = false;
        });
        //鼠标移动监听
        canvasJQ.on('mousemove',function(e){
            e.preventDefault();
            if(isMouseDown){
                //停笔点
                lineToP = coordinateChange(canvasDom, e.clientX, e.clientY);
                //记录时间
                var lineToTime = new Date().getTime();
                //计算距离s和时间差
                var s = Math.sqrt((moveToP.x-lineToP.x)*(moveToP.x-lineToP.x)+(moveToP.y-lineToP.y)*(moveToP.y-lineToP.y));
                var t = lineToTime - moveToTime;
                var v = s / t;
                //动态线宽计算
                lineWidthDynamic = calcLineWidth(v,lineWidthOrigin);
                console.log('lineWidth:'+lineWidthOrigin);
                //保存此次的动态线宽
                lineWidthOrigin = lineWidthDynamic;
                //draw
                canvas.beginPath();
                canvas.moveTo(moveToP.x,moveToP.y);
                canvas.lineTo(lineToP.x,lineToP.y);
                canvas.closePath();
                canvas.lineJoin = 'round';
                canvas.lineWidth = lineWidthDynamic;
                canvas.strokeStyle = lineColor;
                canvas.stroke();
                //用这次的时空信息,初始化下次运算
                moveToP = lineToP;
                moveToTime = lineToTime;
            }
        })
    };
    /*依据运笔速度,动态改变线宽*/
    var calcLineWidth = function(v,lineWidthOrigin){
        var resultLineWidth = 0;
        if(v <= 0.1){
            resultLineWidth = lineWidth;
        }
        if(v >= 10){
            resultLineWidth = 1;
        }
        if(v >0.1 && v <10){
            resultLineWidth = -(30-lineWidth)/(10 - 0.1) * v + (100 * lineWidth - 30)/99;
        }
        if(lineWidthOrigin == -1){
            return resultLineWidth;
        }else {
            //动态线宽的变化仅有26/27
            return 1/27 * resultLineWidth + 26/27 * lineWidthOrigin;
        }
    };
    /*获取设置线宽函数*/
    var getLineWidth = function(){
        $('.btn-line-width').on('click',function (){
            var val = $('#input-line-width').val();
            if(val >= 1 && val <= 30){
                lineWidth = val;
            }
        });
    };
    /*获取设置颜色函数*/
    var getLineColor = function(){
        $('.btn-red').on('click',function(){
            lineColor = $('.btn-red').css('background-color');
        });
        $('.btn-white').on('click',function(){
            lineColor = $('.btn-white').css('background-color');
        });
        $('.btn-black').on('click',function(){
            lineColor = $('.btn-black').css('background-color');
        });
        $('.btn-yellow').on('click',function(){
            lineColor = $('.btn-yellow').css('background-color');
        });
    };
    /*清画布函数*/
    var defaultF = function(canvas){
        $('.btn-default').on('click',function(){
            lineColor = lineColorDefault;
            lineWidth = lineWidthDefault;
            $('#input-line-width').val('');
            //var canvas = $('.canvas').get(0).getContext('2d');
            canvas.fillStyle = 'white';
            canvas.fillRect(0,0,canvasW,canvasH);
            //绘制米字格外框
            drawGrid(canvas);
        })
    };
    $(document).ready(function(){
        var canvasJQ = $('.canvas');
        var canvasDom = canvasJQ.get(0);
        var canvas = canvasDom.getContext('2d');
        //canvas设置宽高
        canvasDom.width = canvasW;
        canvasDom.height = canvasH;
        //获取设置的线宽
        getLineWidth();
        //获取设置的线条颜色
        getLineColor();
        //复原事件监听
        defaultF(canvas);
        //绘制米字格外框
        drawGrid(canvas);
        //鼠标事件监听
        drawF(canvasDom,canvasJQ,canvas);
    })
})();