<template>
    <i class="icon" v-bind:class="displayClass" />
</template>

<script>
export default {
    name: 'ImageFlag',
    props: { 
        value: {
            type: Boolean,
            required: true
        }, 
        trueClass: {
            type: String,
            required: true
        }, 
        falseClass: {
            type: String,
            required: true
        }
    },
    computed: {
        displayClass: function() {
            return (this.value==true) ? this.trueClass : this.falseClass;
        }
    }
}
</script>