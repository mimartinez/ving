<template>
    <Button v-if="isSupported" :class="buttonClass" alt="copy to clipboard" title="Copy to Clipboard" @click="copyToClipboard(text)">
        <Icon name="fa-regular:copy" />
    </Button>
</template>

<script setup>
const notify = useNotify();

const props = defineProps({
    text: String,
    size : {
        default: ''
    }
});

const buttonClass = computed(() => {
    let out = [];
    if (props.size == 'sm') {
        return 'p-button-sm'
    }
    if (props.size == 'lg') {
        return 'p-button-lg'
    }
    if (props.size == 'xs') {
        return 'p-button-sm p-1'
    }
    return out.join(' ');
})
const { copy, isSupported } = useClipboard()

function copyToClipboard(text) {
    copy(text);
    notify.info('Copied to Clipboard');
}
</script>