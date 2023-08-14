<template>
	<div id="hotel-view">
		<div class="bg-right"></div>
		<div class="bg-left"></div>
	</div>
</template>

<style lang="scss">
#hotel-view {
	position: absolute;
	top: 0;
	left: 0;
	min-width: 900px;
	height: 100%;
	width: 100%;
	background-color: #68E5FF;
	z-index: -1;
}

.hotelView {
	background-color: #68E5FF;
}

#hotel-view .bg-left {
	position: absolute;
	left: 0;
	bottom: 0;
	width: 413px;
	height: 124px;
	background-image: url("@/assets/images/hotelview/reception_flathotel_hotel.png");
}

#hotel-view .bg-right {
	position: absolute;
	right: 0;
	bottom: 0;
	z-index: 0;
	width: 484px;
	height: 463px;
	background-image: url("@/assets/images/hotelview/default_new_bg_right.png");
}
</style>