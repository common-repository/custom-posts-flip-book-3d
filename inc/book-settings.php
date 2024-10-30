<?php
	global $post;
	$saved_meta = get_post_meta( $post->ID, 'book_meta', true );
?>
<table class="wp-list-table widefat fixed striped posts">
	<tr>
		<td>Book Mode</td>
		<td>
			<select name="book[book_mode]" class="widefat">
				<option value="dual" <?php echo (isset($saved_meta['book_mode']) && $saved_meta['book_mode'] == 'dual') ? 'selected' : '' ; ?>>Dual Pages</option>
				<option value="single" <?php echo (isset($saved_meta['book_mode']) && $saved_meta['book_mode'] == 'single') ? 'selected' : '' ; ?>>Single Pages</option>
			</select>
		</td>
		<td>
			<p class="description">Display single or double page at a time</p>
		</td>
	</tr>
	<tr>
		<td>Arrows</td>
		<td>
			<label><input name="book[arrows]" type="checkbox" <?php echo (isset($saved_meta['arrows'])) ? 'checked' : '' ; ?>> Show</label>
		</td>
		<td>
			<p class="description">Displays arrows to navigate</p>
		</td>
	</tr>
	<tr>
		<td>Tabs</td>
		<td>
			<label><input name="book[tabs]" type="checkbox" <?php echo (isset($saved_meta['tabs'])) ? 'checked' : '' ; ?>> Show</label>
		</td>
		<td>
			<p class="description">Current page indicator tab</p>
		</td>
	</tr>
	<tr>
		<td>Width</td>
		<td>
			<input name="book[book_width]" type="text" value="<?php echo (isset($saved_meta['book_width'])) ? $saved_meta['book_width'] : '750px' ; ?>">
		</td>
		<td>
			<p class="description">Width of book in pixels</p>
		</td>
	</tr>
	<tr>
		<td>Height (Desktop)</td>
		<td>
			<input name="book[book_height_d]" type="text" value="<?php echo (isset($saved_meta['book_height_d'])) ? $saved_meta['book_height_d'] : '500px' ; ?>">
		</td>
		<td>
			<p class="description">Height of book in pixels for desktop</p>
		</td>
	</tr>
	<tr>
		<td>Height (Mobile)</td>
		<td>
			<input name="book[book_height_m]" type="text" value="<?php echo (isset($saved_meta['book_height_m'])) ? $saved_meta['book_height_m'] : '250px' ; ?>">
		</td>
		<td>
			<p class="description">Height of book in pixels for mobile</p>
		</td>
	</tr>
	<tr>
		<td>Mobile Screen Size</td>
		<td>
			<input name="book[mobile_screen_size]" type="text" value="<?php echo (isset($saved_meta['mobile_screen_size'])) ? $saved_meta['mobile_screen_size'] : '768px' ; ?>">
		</td>
		<td>
			<p class="description">Provide maximum mobile size in pixels</p>
		</td>
	</tr>
</table>