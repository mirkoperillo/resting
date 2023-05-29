<template>
  <button
    class="btn btn-default btn-sm"
    @click.prevent.stop="sort"
    title="Sort bookmarks">
    <i class="fa fa-sort-alpha-asc" aria-hidden="true"></i>
  </button>
</template>

<script>
import bacheca from 'Services/bacheca'

export default {
  methods: {
    sort() {
      bacheca.publish('sortBookmarks')
    },
  },
}
</script>
