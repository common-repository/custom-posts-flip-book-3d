
<div id="wcp-wraper">
	<?php
		$all_images = json_decode($book_meta['images']);
	?>
	<div id="flipbook">
		<?php
		    if ($book_meta['images'] != '') {
		        $all_images = json_decode($book_meta['images']);
		        $img_urls = array();
		        foreach ($all_images as $key => $url) {
		        		$img_urls[] = $url;
		        		if ($key%2 != 0) {
		        			echo '<div class="flipper-page" data-imgurls="'.htmlspecialchars(json_encode($img_urls)).'"></div>';
		        			$img_urls = array();
		        		}
		        	?>					
		        <?php }
		    }
		?>
	</div>

</div>