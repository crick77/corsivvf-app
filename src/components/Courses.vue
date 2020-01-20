<template>
    <div class="ui container">
        <table class="ui celled table">
            <thead>
                <th>Titolo</th>
                <th>Descrizione</th>
                <th>Creazione</th>
                <th>Aggiornamento</th>
                <th>Abilitato</th>
            </thead>
            <tbody v-if="!loading">
                <tr v-for="course in courses" :key="course.id">
                    <td>{{ course.titolo }}</td>
                    <td>{{ course.descrizione }}</td>
                    <td>{{ course.dataCreazione | formatDate }}</td>
                    <td>{{ course.dataAggiornamento | formatDate }}</td>
                    <td class="center aligned"><imageFlag v-bind:value="course.abilitato" trueClass="check" falseClass="close" /></td>
                </tr>
                <tr v-if="courses.length == 0">
                    <td colspan="5" class="center aligned">Nessun corso in archivio.</td>
                </tr>
            </tbody>
            <tbody v-if="loading">
                <tr>
                    <td colspan="5">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin:auto;background:#fff;display:block;" width="48px" height="48px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                            <g transform="rotate(0 50 50)">
                            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
                                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.9166666666666666s" repeatCount="indefinite"></animate>
                            </rect>
                            </g><g transform="rotate(30 50 50)">
                            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
                                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.8333333333333334s" repeatCount="indefinite"></animate>
                            </rect>
                            </g><g transform="rotate(60 50 50)">
                            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
                                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.75s" repeatCount="indefinite"></animate>
                            </rect>
                            </g><g transform="rotate(90 50 50)">
                            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
                                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.6666666666666666s" repeatCount="indefinite"></animate>
                            </rect>
                            </g><g transform="rotate(120 50 50)">
                            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
                                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5833333333333334s" repeatCount="indefinite"></animate>
                            </rect>
                            </g><g transform="rotate(150 50 50)">
                            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
                                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5s" repeatCount="indefinite"></animate>
                            </rect>
                            </g><g transform="rotate(180 50 50)">
                            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
                                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.4166666666666667s" repeatCount="indefinite"></animate>
                            </rect>
                            </g><g transform="rotate(210 50 50)">
                            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
                                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.3333333333333333s" repeatCount="indefinite"></animate>
                            </rect>
                            </g><g transform="rotate(240 50 50)">
                            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
                                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.25s" repeatCount="indefinite"></animate>
                            </rect>
                            </g><g transform="rotate(270 50 50)">
                            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
                                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.16666666666666666s" repeatCount="indefinite"></animate>
                            </rect>
                            </g><g transform="rotate(300 50 50)">
                            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
                                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.08333333333333333s" repeatCount="indefinite"></animate>
                            </rect>
                            </g><g transform="rotate(330 50 50)">
                            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
                                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animate>
                            </rect>
                            </g>
                        </svg>
                    </td>
                </tr>
            </tbody>
            <tfoot v-if="(courses.length != 0) && (!loading)">
                <th colspan="4">{{ courses.length }} corsi in archivio.</th>
                <th class="center aligned"><i @click="refresh" class="icon refresh" /></th>
            </tfoot>
        </table>
    </div>
</template>

<script>
import ImageFlag from './ImageFlag'

export default {
    name: 'Courses',
    components: {
        ImageFlag
    },
    data() {
        return {
            courses: [],
            loading: true
        }
    },
    created() {
        this.refresh();
    },
    methods: {
        refresh() {
            this.courses = [];
            this.loading = true;

            let headers = new Headers();
            if(this.$store.state.userToken!=null) {
                headers.append("Authorization", "Bearer "+this.$store.state.userToken);
            }

            let initParams = { 
                headers: headers,
                mode: 'cors',
                cache: 'default'
            };

            fetch('http://localhost:8080/Corsi-VVF-web/api/courses', initParams)
                    .then(listResponse => listResponse.json())
                    .then(urlList => {
                        urlList.forEach(url => {
                        fetch(url)
                            .then(itemResponse => itemResponse.json())
                            .then(item => this.courses.push(item));      
                        })
                    })
                    .then(() => {
                        window.setTimeout(() => {
                            console.log("FINISHED!!");
                            this.loading = false;
                        }, 2000);
                    });
        }
    }
}
</script>

<style>
    h1.ui.center.header {
        margin-top: 3em;
    }

    .ui.table th:not(:first-child):hover {
        cursor: pointer;
    }

    .ui.table tr:hover {
        background-color: rgb(246, 246, 246);
    }

    i:hover {
        cursor: pointer;
    }
</style>