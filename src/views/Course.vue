<template>
    <div>   
        Course edit
        Titolo: {{ course.titolo }}
    </div>
</template>

<script>
export default {
    name: 'Course',
    data: () => ({
        loading: true,
        error: false,
        courseid: null,
        course: {}
    }),
    created() {
        this.loading = true;
        this.courseid = this.$route.params.courseid;

        let headers = new Headers();
            if(this.$store.state.userToken!=null) {
                headers.append("Authorization", "Bearer "+this.$store.state.userToken);
            }

            let initParams = { 
                headers: headers,
                mode: 'cors',
                cache: 'default'
            };

            fetch('http://localhost:8080/Corsi-VVF-web/api/courses/'+this.courseid, initParams)
            .then(response => {
                if(!response.ok) {
                    throw Error(response.status);
                }
                return response;
            })
            .then(response => response.json())
            .then(jsonResp => {
                this.course = jsonResp;
            })
            .then(() => {
                window.setTimeout(() => {
                    console.log("FINISHED!!");
                    this.loading = false;
                }, 2000);
            })
            .catch(error => {
                console.log("ERROR: "+error.message);
                switch(error.message) {
                    case '401': {
                        console.log("Going to home...");
                        this.$router.push('/');
                        break;
                    }
                    default: {
                        this.error = true;
                    }
                }
            });
    }
}
</script>