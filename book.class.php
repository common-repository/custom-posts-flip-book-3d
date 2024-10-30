<?php
/**
* Main Class for Book 3D
*/
class WCP_Posts_Booklet
{
	public $page_number = 0;
	public $content_arr = array();
	public $single_classes = array();
	
	function __construct()
	{
		add_action( 'init', array($this, 'register_book_pt') );
		add_action( 'add_meta_boxes', array($this, 'carousel_metaboxes' ), 10, 2 );
		add_action( 'admin_enqueue_scripts', array($this, 'admin_scripts' ) );
		add_shortcode( 'post-book', array($this, 'render_shortcode') );
		add_action( 'wp_ajax_wcp_get_posts', array($this, 'wcp_get_posts') );
		add_action('wp_ajax_wcp_get_terms', array($this, 'get_terms'));
		add_action( 'save_post', array($this, 'save_books' ) );
	}

	/**
	 * Register a carousels post type.
	 *
	 * @link http://codex.wordpress.org/Function_Reference/register_post_type
	 */
	function register_book_pt() {
		$labels = array(
			'name'               => _x( 'Post Books', 'Posts Book', 'post-book' ),
			'singular_name'      => _x( 'Book', 'Book', 'post-book' ),
			'menu_name'          => _x( 'Post Books', 'admin menu', 'post-book' ),
			'name_admin_bar'     => _x( 'Post Books', 'Post Books', 'post-book' ),
			'add_new'            => _x( 'Add New', 'Post Book', 'post-book' ),
			'add_new_item'       => __( 'Add New Book', 'post-book' ),
			'new_item'           => __( 'New Book', 'post-book' ),
			'edit_item'          => __( 'Edit Book', 'post-book' ),
			'view_item'          => __( 'View Book', 'post-book' ),
			'all_items'          => __( 'All Post Books', 'post-book' ),
			'search_items'       => __( 'Search Post Books', 'post-book' ),
			'parent_item_colon'  => __( 'Parent Post Books:', 'post-book' ),
			'not_found'          => __( 'No Books found.', 'post-book' ),
			'not_found_in_trash' => __( 'No Books found in Trash.', 'post-book' )
		);

		$args = array(
			'labels'             => $labels,
	        'description'        => __( 'Create Post Books.', 'post-book' ),
			'public'             => false,
			'publicly_queryable' => false,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'menu_icon'       	 => 'dashicons-book-alt',
			'query_var'          => true,
			'capability_type'    => 'post',
			'has_archive'        => false,
			'hierarchical'       => false,
			'supports'           => array( 'title' )
		);

		register_post_type( 'wcp_post_book', $args );
	}

	function carousel_metaboxes( $post_type, $post ) {
	    add_meta_box( 'wcp-contents', 'Book Contents', array($this, 'render_contents_box'), 'wcp_post_book', 'normal');
	    add_meta_box( 'wcp-settings', 'Book Settings', array($this, 'render_settings_box'), 'wcp_post_book', 'normal');
	    add_meta_box( 'wcp-shortcode', 'Shortcode', array($this, 'render_sc_box'), 'wcp_post_book', 'side');
	}

	function render_sc_box($book){
		if (isset($book->ID)) { ?>
			<p style="text-align:center;">
				<b>Default Shortcode</b><br>
				[post-book id="<?php echo $book->ID; ?>"]
			</p>
			<hr>
			<p style="text-align:center;">
				<b>Display 10 Latest Posted</b><br>
				[post-book id="<?php echo $book->ID; ?>" order="DESC" orderby="date" count="10"] <br>
			</p>
			<hr>
			<p style="text-align:center;">
				<b>Order by Ascending Titles</b><br>
				[post-book id="<?php echo $book->ID; ?>" order="ASC" orderby="title"] <br>
			</p>
		<?php }
	}

	function render_contents_box(){
		include 'inc/book-contents.php';
	}

	function render_settings_box(){
		include 'inc/book-settings.php';
		wp_nonce_field( plugin_basename( __FILE__ ), 'wcp_post_book_nonce' );
	}

	function render_shortcode($attrs){
		if (isset($attrs['id']) && $attrs['id'] != '') {
		wp_enqueue_style( 'wcp-flipbook-styles', plugins_url( 'css/flipper.min.css' , __FILE__ ));
		wp_enqueue_script( 'wcp-flipbook-script', plugins_url( 'js/flipper.js' , __FILE__ ), array('jquery'));
		wp_enqueue_script( 'wcp-flipbook-trigger', plugins_url( 'js/script.js' , __FILE__ ), array('jquery'));
		wp_localize_script( 'wcp-flipbook-trigger', 'wcpbook', array('path' => plugins_url( 'images/' , __FILE__ ) ) );
		$book_settings = get_post_meta( $attrs['id'], 'book_meta', true );
			ob_start();
			include 'inc/render.php';
			return ob_get_clean();
		}
	}

	function admin_scripts($slug){
		global $post;
        if ( $slug == 'post-new.php' || $slug == 'post.php') {
            if (isset($post->post_type) && 'wcp_post_book' === $post->post_type) {
            	wp_enqueue_style( 'wp-color-picker' );
				wp_enqueue_style( 'select2-css', plugin_dir_url( __FILE__ ).'/css/select2.min.css' );
				wp_enqueue_style( 'wcp-admin-css', plugin_dir_url( __FILE__ ).'/css/admin.css' );
				wp_enqueue_script( 'select2-js', plugin_dir_url( __FILE__ ).'/js/select2.min.js', array('jquery') );
				wp_enqueue_script( 'carousel-admin', plugin_dir_url( __FILE__ ).'/js/admin.js', array('jquery', 'wp-color-picker') );
            }
        }		
	}

	function wcp_get_posts(){
		// print_r($_REQUEST);
		extract($_REQUEST);
		$all_posts = get_posts( array('post_type' => $post_type, 'posts_per_page' => -1 ) );
		foreach ($all_posts as $key => $post_obj) {
			echo '<option value="'.$post_obj->ID.'">'.$post_obj->post_title.'</option>';
		}
		// var_dump($all_posts);
		die(0);
	}

	function get_terms(){
		extract($_REQUEST);
		$terms = get_terms( $taxonomy );
		if (empty($terms) || $taxonomy == '') {
			echo __( 'Sorry! this Taxonomy has no Terms.', 'post-book' );
		} else {
			echo '<select class="wcp-term widefat" name="car[term]">';
			foreach ($terms as $key => $value) {
				echo '<option value="'.$value->term_id.'">'.$value->name.'('.$value->count.')</option>';
			}
			echo '</select>';			
		}
		die(0);
	}

	function save_books($post_id){
        // verify if this is an auto save routine. 
        // If it is our form has not been submitted, so we dont want to do anything
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) 
            return;

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
        if ( !isset( $_POST['wcp_post_book_nonce'] ) )
            return;

        if ( !wp_verify_nonce( $_POST['wcp_post_book_nonce'], plugin_basename( __FILE__ ) ) )
            return;

        // OK, we're authenticated: we need to find and save the data

        if (isset($_POST['book']) && $_POST['book'] != '') {
        	$data_to_save = array();
        	$post_ids = array();

        	foreach ($_POST['book'] as $name => $value) {
        		if (!is_array($value)) {
        			$data_to_save[$name] = sanitize_text_field( $value );
        		} else {
        			foreach ($value as $p_id) {
        				$data_to_save['posts'][] = intval($p_id);
        			}
        		}
        	}
            update_post_meta( $post_id, 'book_meta', $data_to_save );
        }		
	}


}
?>