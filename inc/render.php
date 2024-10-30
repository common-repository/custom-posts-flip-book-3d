<?php
    extract($book_settings);

    // Query Arguments
    $args = array(
        'posts_per_page'   => (isset($attrs['count'])) ? $attrs['count'] : -1,
        'ignore_sticky_posts' => true,
        'order' => (isset($attrs['order'])) ? $attrs['order'] : 'DESC',
        'orderby' => (isset($attrs['orderby'])) ? $attrs['orderby'] : 'date',
    );


    if (isset($book_settings['display_by']) && $book_settings['display_by'] == 'taxonomy') {
        $exclude_ids_arr = explode(",",$book_settings['exclude_ids']);
        $args['post__not_in'] = $exclude_ids_arr;
        $args['tax_query'] = array(
            array(
                'taxonomy'         => $book_settings['taxonomy'],
                'terms'            => array( $book_settings['term'] ),
                'include_children' => true,
            ),
        );
    } else {
        $args['post_type'] = $post_type;
        $args['post__in'] = $posts;
    }

    $car_query = new WP_Query( $args );


    // The Loop
    if ( $car_query->have_posts() ) { ?>

        <div class="bookwrap <?php echo $book_settings['book_mode']; ?>" style="width:100%;margin:0 auto;max-width:<?php echo $book_settings['book_width']; ?>;">
            <img class="book-loading" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Loading" style="width:100%;height:1px;">
            <div class="wcpflipbook <?php echo ($book_mode == 'single') ? 'single_pages' : '' ; ?>"
                data-mode="<?php echo esc_attr( $book_settings['book_mode'] ); ?>"
                data-width="<?php echo $book_settings['book_width']; ?>">

                <?php while ( $car_query->have_posts() ) {
                    $car_query->the_post(); ?>

                        <?php if ($book_mode == 'single') {

                            $content_post = get_post(get_the_id());
                            $content = $content_post->post_content;
                            $content = apply_filters('the_content', $content);
                            $content = str_replace(']]>', ']]&gt;', $content);
                            $this->content_arr[] = '<h2>'.get_the_title().'</h2>'. $content;
                            $this->single_classes[] = 'cssclasses';
                            if ($this->page_number%2 != 0) {
                                echo '<div class="flipper-page" data-styles="'.htmlspecialchars(json_encode($this->single_classes)).'" data-imgurls="'.htmlspecialchars(json_encode($this->content_arr)).'"></div>';
                                $this->content_arr = array();
                                $this->single_classes = array();
                            }
                            $this->page_number++;
                        } else { ?>
                            <div class="flipper-page" data-styles="cssclasses">
                                <h2><?php the_title(); ?></h2>
                                <?php echo the_content(); ?>
                            </div>
                        <?php } ?>

                <?php } ?>

            </div>
        </div>
        <?php wp_reset_postdata();
    } else {
        echo 'Book contents not found!';
    }
?>
<style>
    .wcpflipbook {
        height: <?php echo $book_height_d; ?> !important;
    }
    .flipper-prev-page, .flipper-next-page {
        display: <?php echo (isset($arrows)) ? 'block' : 'none' ; ?>
    }
    .flipper-pager-wrap {
        display: <?php echo (isset($tabs)) ? 'block' : 'none' ; ?>
    }
    .flipper-page h2 {
        text-align: center;
    }
    .flipper-page {
        padding: 10px !important;
    }
    .flipper-page img {
        max-width: 100%;
    }
    .cssclasses {
        background-color: <?php echo $bg_color ?> !important;
        color: <?php echo $text_color ?> !important;
    }
    @media only screen and (max-width: <?php echo $mobile_screen_size; ?>){
        .wcpflipbook {
            height: <?php echo $book_height_m; ?> !important;
        }
    }
</style>