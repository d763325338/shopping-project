$(function(){
	// console.log($('.login-message').html());
	if(getcookie('username')){
		$('.login-message').html('尊敬的会员：'+getcookie('username')+',您好，以下是您的购物车');
		console.log(1)
		$('.top_main_left').hover(function(){
			$(this).find('.top_main_left_show').addClass('show')},
			function(){
			 $(this).find('.top_main_left_show').removeClass('show')
			});
		$('.top_main_right li').hover(function(){
			$(this).find('div').addClass('show')},
			function(){
			 $(this).find('div').removeClass('show')
			});
			$('.fixed_nav_left_cart').on('click',function(){
        window.location.replace('http://127.0.0.1/js1810/bailianshangcheng/h51810/bailianshangcheng/src/cart.html');
        }
    )
	!function(){
		//1.渲染商品列表, 传入两个参数，一个id和数量，根据id和数量渲染整个可见的列表.
		function goodslist(id,count){
			$.ajax({
				url:'http://127.0.0.1/js1810/bailianshangcheng/h51810/bailianshangcheng/php/data.php',//获取所有的接口数据
				dataType:'json'
			}).done(function(data){
				$.each(data,function(index,value){
					if(id==value.sid){//遍历判断sid和传入的sid是否相同，方便将那条数据设置到渲染的商品列表中。
						var $clonebox=$('.goods_box:hidden').clone(true,true);
						$clonebox.find('img').attr('src',value.url);
						$clonebox.find('img').attr('sid',value.sid);
						$clonebox.find('.name').find('a').html(value.title);
						$clonebox.find('.goods_item_price').find('span').html(value.price);
						$clonebox.find('.goods_count').find('input').val(count);
						//计算每个商品的价格。
						$clonebox.find('.goods_total_price').find('span').html((value.price*count).toFixed(2));
						$clonebox.css('display','block');
						$('.goods ul').append($clonebox);
						priceall();//计算总价的
					}
				});
			})
		}
		//2.获取cookie，执行渲染列表的函数
		if(getcookie('cookiesid') && getcookie('cookienum')){
			var s=getcookie('cookiesid').split(',');//数组sid
			var n=getcookie('cookienum').split(',');//数组num
			$.each(s,function(i,value){
				goodslist(s[i],n[i]);
			});
		}

		//3.如果购物车为空，显示empty-cart盒子(购物车空空的)
		kong();
		function kong(){
			if(getcookie('cookiesid') && getcookie('cookienum')){
				$('.empty-cart').hide();//cookie存在，购物车有商品，隐藏盒子。
				$('.goods_payfrom').show();
			}else{
				$('.empty-cart').show();
				$('.goods_payfrom').hide();
			}
		}

		//4.计算总价和总的商品件数，必须是选中的商品。
		function priceall(){
			var $sum=0;
			var $count=0;
			$('.goods_box:visible').each(function(index,element){
			  if($(element).find('input').prop('checked')){
				  $sum+=parseInt($(element).find('.goods_count').find('input').val());
				$count+=parseFloat($(element).find('.goods_total_price').find('span').html());
			  }
			});

			$('.cart_count span').html($sum);
			$('.cart_totalprice b').html($count.toFixed(2));
			$('.name span').html($('.goods_box:visible input:checked').size());
		}
		$('.name span').html($('.goods_box:visible input:checked').size());
		//5.全选操作
		$('.allsel').on('change',function(){
			$('.goods_box:visible').find(':checkbox').prop('checked',$(this).prop('checked'));
			$('.allsel').prop('checked',$(this).prop('checked'));
			priceall();//取消选项，重算总和。
		});

		var $inputs=$('.goods_box:visible').find(':checkbox');
		$('.goods li').on('change',$inputs,function(){//事件的委托的this指向被委托的元素
			if($('.goods_box:visible').find('input:checkbox').length==$('.goods_box:visible').find('input:checked').size()){
				$('.allsel').prop('checked',true);
			}else{
				$('.allsel').prop('checked',false);
			}
			priceall();//取消选项，重算总和。
		});

		//6.数量的改变
		//改变商品数量++
		$('#add').on('click', function() {
			var $count = $(this).parents('.goods_box').find('.goods_count input').val();//值
			$count++;
			if ($count >= 99) {
				$count = 99;
			}
			$(this).parents('.goods_box').find('.goods_count input').val($count);//赋值回去
			 $(this).parents('.goods_box').find('.goods_total_price').find('span').html(singlegoodsprice($(this)));//改变后的价格
			priceall();//重新计算总和。
			setcookie($(this));//将改变的数量重新添加到cookie

		});

		//改变商品数量--
		$('#reduce').on('click', function() {
			var $count = $(this).parents('.goods_box').find('.goods_count input').val();
			$count--;
			if ($count <= 1) {
				$count = 1;
			}
			$(this).parents('.goods_box').find('.goods_count input').val($count);
			$(this).parents('.goods_box').find('.goods_total_price').find('span').html(singlegoodsprice($(this)));//改变后的价格
			priceall();
			setcookie($(this));
		});

		//直接输入改变数量
		$('.goods_count input').on('input', function() {
			var $reg = /^\d+$/g; //只能输入数字
			var $value = parseInt($(this).val());
			if ($reg.test($value)) {//是数字
				if ($value >= 99) {//限定范围
					$(this).val(99);
				} else if ($value <= 0) {
					$(this).val(1);
				} else {
					$(this).val($value);
				}
			} else {//不是数字
				$(this).val(1);
			}
			$(this).parents('.goods_box').find('.goods_total_price').find('span').html(singlegoodsprice($(this)));//改变后的价格
			priceall();
			setcookie($(this));
		});

		//7.计算数量改变后单个商品的价格
		function singlegoodsprice(obj) { //obj:当前元素
			var $dj = parseFloat(obj.parents('.goods_box').find('.goods_item_price').find('span').html());//单价
			var $cnum = parseInt(obj.parents('.goods_box').find('.goods_count input').val());//数量
			return ($dj * $cnum).toFixed(2);//结果
		}

		//8.将改变后的数量的值存放到cookie
		//点击按钮将商品的数量和id存放cookie中
		var arrsid=[]; //商品的id
		var arrnum=[]; //商品的数量
		//提前获取cookie里面id和num
		function cookietoarray(){
			if(getcookie('cookiesid') && getcookie('cookienum')){
				arrsid=getcookie('cookiesid').split(',');//cookie商品的sid
				arrnum=getcookie('cookienum').split(',');//cookie商品的num
			}
		}
		function setcookie(obj) { //obj:当前操作的对象
			cookietoarray();//得到数组
			var $index = obj.parents('.goods_box').find('img').attr('sid');//通过id找数量的位置
			arrnum[$.inArray($index,arrsid)] = obj.parents('.goods_box').find('.goods_count input').val();
			addcookie('cookienum', arrnum.toString(), 7);
		}

		//9.删除操作
		//删除cookie
		function delgoodslist(sid, arrsid) {//sid：当前删除的sid，arrsid:cookie的sid的值
			var $index = -1;
			$.each(arrsid,function(index,value){//删除的sid对应的索引位置。 index:数组项的索引
				if(sid==value){
					$index=index;//如果传入的值和数组的值相同，返回值对应的索引。
				}
			});
			arrsid.splice($index, 1);//删除数组对应的值
			arrnum.splice($index, 1);//删除数组对应的值
			addcookie('cookiesid', arrsid.toString(), 7);//添加cookie
			addcookie('cookienum', arrnum.toString(), 7);//添加cookie
		}

		//删除单个商品的函数(委托)
		$('.goods li').on('click', '.delete', function(ev) {
			cookietoarray();//得到数组,上面的删除cookie需要。
			if(confirm('你确定要删除吗？')){
				 $(this).first().parents('.goods_box').remove();//通过当前点击的元素找到整个一行列表，删除
			}
			delgoodslist($(this).first().parents('.goods_box').find('img').attr('sid'), arrsid);
			priceall();
			kong();
		});


		//删除全部商品的函数
		$('.all_delete').on('click', function() {
			cookietoarray();//得到数组,上面的删除cookie需要。
			if(confirm('你确定要全部删除吗？')){
				$('.goods_box:visible').each(function() {
					if ($(this).find('input:checkbox').is(':checked')) {//复选框一定是选中的
						$(this).remove();
						delgoodslist($(this).find('img').attr('sid'), arrsid);
					}
				});
				priceall();
				kong();
			}
		});
	}();
    }

})