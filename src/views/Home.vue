<template>
<div class="page-home">
	<Queue />
	<Chat />
</div>
</template>

<script>
import Chat from '@/components/Chat'
import Queue from '@/components/Queue'

export default {
	components: {
		Chat,
		Queue,
	},
}
</script>
