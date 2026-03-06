let eventBus = new Vue()

Vue.component('product-details', {
    template: `
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>
    `,
    props: ["details"],
});

Vue.component('product-review', {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
            
             <p v-if="errors.length">
                 <b>Please correct the following error(s):</b>
                 <ul>
                    <li v-for="error in errors">{{ error }}</li>
                 </ul>
             </p>
            
             <p>
                <label for="name">Name:</label>
                <input id="name" v-model="name" placeholder="name" :style="{ border: errors.name[0] ? '1px solid red' : '1px solid black' }">
                <span v-show="errors.name[0]" style="color: red">{{ errors.name[0] }}</span>
             </p>
    
             <p>
               <label for="review">Review:</label>
               <textarea id="review" v-model="review" :style="{ border: errors.review[0] ? '1px solid red' : '1px solid black' }"></textarea>
               <span v-show="errors.review[0]" style="color: red">{{ errors.review[0] }}</span>
             </p>
    
             <p>
               <label for="rating">Rating:</label>
               <select id="rating" v-model.number="rating" :style="{ border: errors.rating[0] ? '1px solid red' : '1px solid black' }">
                 <option>5</option>
                 <option>4</option>
                 <option>3</option>
                 <option>2</option>
                 <option>1</option>
               </select>
               <span v-show="errors.rating[0]" style="color: red">{{ errors.rating[0] }}</span>
             </p>
             <p>
               <label>Would you recommend this product?</label><br>
               <input type="radio" id="recommend-yes" value="yes" v-model="recommend">
               <label for="recommend-yes">Yes</label>
               <input type="radio" id="recommend-no" value="no" v-model="recommend">
               <label for="recommend-no">No</label>
               <span v-if="errors.recommend" style="color: red; display: block; margin-top: 5px;">{{ errors.recommend }}</span>
             </p>
            
             <p>
               <input type="submit" value="Submit"> 
             </p>
            
        </form>

 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: {
                name: [],
                review: [],
                rating: [],
                recommend: ''
            },
        }
    },

    computed: {
        allErrors() {
            const errors = [];
            if (this.errors.name.length) errors.push(...this.errors.name);
            if (this.errors.review.length) errors.push(...this.errors.review);
            if (this.errors.rating.length) errors.push(...this.errors.rating);
            if (this.errors.recommend) errors.push(this.errors.recommend);
            return errors;
        },
        hasErrors() {
            return this.allErrors.length > 0;
        }
    },

    methods:{
        onSubmit() {
            this.errors.name = [];
            this.errors.review = [];
            this.errors.rating = [];
            this.errors.recommend = '';

            if(this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend,
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if(!this.name) this.errors.name.push("Name required.")
                if(!this.review) this.errors.review.push("Review required.")
                if(!this.rating) this.errors.rating.push("Rating required.")
                if(!this.recommend) this.errors.recommend = "Please tell us if you would recommend this product."
            }
        }

    },

});

Vue.component('product-tabs', {
    template: `
    <div>
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <li v-for="review in reviews">
             <p>{{ review.name }}</p>
             <p>Rating: {{ review.rating }}</p>
             <p>{{ review.review }}</p>
             {{ review.recommend === 'yes' ? 'Yes' : 'No' }}
           </li>
         </ul>
       </div>
       
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
     
       <div v-show="selectedTab === 'Details'">
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
       </div>
       
     <div v-show="selectedTab === 'Shipping'">
        <p>{{ shipping }}</p>
     </div>
     
   </div>
`,

    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews',
        }
    },
    props: {
        reviews: {
            type: Array,
            required: false
        },
        shipping: {
            type: [String, Number],
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },

});

Vue.component('product', {
    template: `
    <div class="product">
        <div class="product-image">
            <img :src="image" :alt="altText" />
        </div>

        <div class="product-info">
            <h1>{{ title }}</h1>
            <a :href="linkText">More products like this</a>
            <p v-if="inStock > 10">In Stock</p>
            <p v-else-if="inStock <= 10 && inStock > 0">Almost sold out!</p>
            <p v-else :class="{outStock: !inStock}">Out of Stock</p>
            <span v-if="onSale"> On Sale </span>
            <p>{{ sale }}</p>
            <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor:variant.variantColor }"
                    @mouseover="updateProduct(index)"
            ></div>

            <ul>
                <li v-for="size in sizes">{{ size }}</li>
            </ul>

            <button
                    v-on:click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }">
                Add to cart
            </button> 
            <br>
            <button v-on:click="removeFromCart">Remove from cart</button>
            <product-tabs :reviews="reviews" :shipping="shipping" :details="details"></product-tabs>
        </div>
    </div>
    `,
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            selectedVariant: 0,
            altText: "A pair of socks",
            linkText: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            inventory: 0,
            onSale: true,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            reviews: [],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0,
                }
            ],

            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            cart: 0,
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },

        removeFromCart() {
            this.$emit("remove-from-cart", this.variants[this.selectedVariant].variantId,
            );
        },

        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },

        addReview(productReview) {
            this.reviews.push(productReview);
            localStorage.setItem('vue-product-reviews', JSON.stringify(this.reviews));
        },
    },

    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
            localStorage.setItem('vue-product-reviews', JSON.stringify(this.reviews));
        })
        const saved = localStorage.getItem('vue-product-reviews');
        if (saved) {
            this.reviews = JSON.parse(saved);
        }
    },

    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' are on sale';
            } else {
                return this.brand + ' ' + this.product + ' are not on sale';
            }
        },

        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 3
            }
        },

    },
})


let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        removeFromCart(id) {
            this.cart.pop(id);
        },
    },

});