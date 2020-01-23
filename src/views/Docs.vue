<template>
    <div>
        Documenti del corso ID={{ courseid }}!
    </div>
</template>

<script>
export default {
    name: 'Docs',
    data: () => ({
        loading: true,
        error: false,
        errorMessage : '',
        courseid: null,
    }),
    created() {
        this.courseid = this.$route.params.courseid;
    }
}
</script>