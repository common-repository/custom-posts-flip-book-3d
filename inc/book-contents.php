<?php
	global $post;
	$saved_meta = get_post_meta( $post->ID, 'book_meta', true );
	$selected_post_ids = (isset($saved_meta['posts'])) ? $saved_meta['posts'] : '' ;
?>
<table class="wp-list-table widefat fixed striped posts">
	<tr>
		<td><?php _e( 'Display By', 'post-book' ) ?></td>
		<td>
			<select name="book[display_by]" class="widefat select-list-by">
				<option value="" <?php echo (isset($saved_meta['display_by']) && $saved_meta['display_by'] == '') ? 'selected' : '' ; ?>>By Post Type</option>
				<option value="taxonomy" <?php echo (isset($saved_meta['display_by']) && $saved_meta['display_by'] == 'taxonomy') ? 'selected' : '' ; ?>>By Taxonomy</option>
			</select>
		</td>
		<td>
			<p class="description"><?php _e( 'Select how you want to choose posts', 'post-book' ); ?></p>
		</td>
	</tr>
	<tr class="tax-list-row if-by-tax">
		<td><?php _e( 'Select Taxonomy', 'post-book' ); ?></td>
		<td>
		<select class="wcp-taxonomy widefat" name="book[taxonomy]"> 
		 <option value=""><?php echo esc_attr(__('Select Taxonomy')); ?></option> 
		 <?php 
		  $taxonomies = get_taxonomies(array('public'   => true));
		  foreach ($taxonomies as $tax) { 
		  	$selected = (isset($saved_meta['taxonomy']) && $saved_meta['taxonomy'] == $tax) ? 'selected' : '' ;
		  	$option = '<option value="'.$tax.'" '.$selected.'>';
			$option .= $tax;
			$option .= '</option>';
			echo $option;
		  }
		 ?>
		</select>		  						
		</td>
		<td>
			<p class="description"><?php _e( 'Select Taxonomy', 'post-book' ); ?>.</p>
		</td>
	</tr>
	<tr class="if-by-tax">
		<td><?php _e( 'Select Term', 'post-book' ); ?></td>
		<td class="append-terms">
			<?php
				if (isset($saved_meta['taxonomy']) && $saved_meta['taxonomy'] != '') {
					$terms = get_terms( $saved_meta['taxonomy'] );
					if (empty($terms)) {
						echo __( 'Sorry! this Taxonomy has no Terms.', 'post-book' );
					} else {
						echo '<select class="wcp-term widefat" name="book[term]">';
						foreach ($terms as $key => $value) {
							$selected = (isset($saved_meta['term']) && $saved_meta['term'] == $value->term_id) ? 'selected' : '' ;
							echo '<option value="'.$value->term_id.'" '.$selected.'>'.$value->name.'('.$value->count.')</option>';
						}
						echo '</select>';			
					}					
				} else { ?>
					<p class="description"><?php _e( 'Please select any taxonomy first', 'post-book' ); ?>.</p>
				<?php }
			?>
		</td>
		<td>
			<p class="description"><?php _e( 'Select Term which posts will be shown in Book', 'post-book' ); ?>.</p>
		</td>
	</tr>
	<tr class="if-by-tax">
		<td><?php _e( 'Exclude Posts', 'post-book' ); ?></td>
		<td>
			<input type="text" class="exclude-ids widefat" value="<?php echo (isset($saved_meta['exclude_ids'])) ? $saved_meta['exclude_ids'] : '' ; ?>" name="book[exclude_ids]">
		</td>
		<td>
			<p class="description"><?php _e( 'Comma separated ids of posts that you do not want to display', 'post-book' ); ?>.</p>
		</td>
	</tr>
	<tr class="if-by-post">
		<td>Select Post Type</td>
		<td>
			<select name="book[post_type]" id="select-post-type" class="widefat">
				<option value=""><?php _e( 'Select Post Type', 'post-book' ); ?></option>
			<?php $post_types = get_post_types( array( 'public' => true, ) );
				foreach ($post_types as $name => $label) {
					$selected = (isset($saved_meta['post_type']) && $saved_meta['post_type'] == $name) ? 'selected' : '' ;
					echo '<option value="'.$name.'" '.$selected.'>'.$label.'</option>';
				}
			?>
			</select>
		</td>
		<td>
			<p class="description"><?php _e( 'Please select post type here', 'post-book' ); ?></p>
		</td>
	</tr>
	<tr class="if-by-post">
		<td>Select Posts</td>
		<td>
			<img src="<?php echo plugin_dir_url( dirname(__FILE__) ); ?>images/ajax-loader.gif" alt="Loading Posts" style="display:none;" class="posts-loader">
			<select name="book[posts][]" id="select-posts" style="display:<?php echo (isset($saved_meta['post_type']) && $saved_meta['post_type'] != '') ? '' : 'none' ; ?>;" class="widefat" multiple>
				<?php
					if (isset($saved_meta['post_type']) && $saved_meta['post_type'] != '') {
						$all_posts = get_posts( array('post_type' => $saved_meta['post_type'], 'posts_per_page' => -1 ) );
						foreach ($all_posts as $key => $post_obj) {
							if ($selected_post_ids != '' && is_array($selected_post_ids)) {
								$selected = (in_array($post_obj->ID, $selected_post_ids)) ? 'selected' : '' ;
							}
							echo '<option value="'.$post_obj->ID.'" '.$selected.'>'.$post_obj->post_title.'</option>';
						}
					}
				?>				
			</select>
		</td>
		<td>
			<p class="description"><?php _e( 'Choose posts to display in Book', 'post-book' ); ?></p>
		</td>
	</tr>
	<tr>
		<td><?php _e( 'Background Color', 'post-book' ); ?></td>
		<td>
			<input type="text" name="book[bg_color]" class="widefat colorpicker" value="<?php echo (isset($saved_meta['bg_color'])) ? $saved_meta['bg_color'] : '' ; ?>">
		</td>
		<td>
			<p class="description"><?php _e( 'Choose background color for book pages', 'post-book' ); ?></p>
		</td>
	</tr>
	<tr>
		<td><?php _e( 'Text Color', 'post-book' ); ?></td>
		<td>
			<input type="text" name="book[text_color]" class="widefat colorpicker" value="<?php echo (isset($saved_meta['text_color'])) ? $saved_meta['text_color'] : '' ; ?>">
		</td>
		<td>
			<p class="description"><?php _e( 'Choose text color, Leave blank for default', 'post-book' ); ?></p>
		</td>
	</tr>
</table>