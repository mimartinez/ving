<template>
    <Title>Create an Account for {{ config.public?.site?.name }}</Title>
    <div class="w-full lg:w-7 mx-auto">
        <div class="text-center mb-5">
            <img :src="config.public.site.logoUrl" :alt="config.public.site.name" height="50" class="mb-3">
            <h1 class="text-900 text-3xl font-medium mb-3 mt-0">Reset Password</h1>
            <span class="text-600 font-medium line-height-3">Remember your account?</span>
            <NuxtLink to="/user/login" class="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Sign in
            </NuxtLink>
        </div>
        <PanelZone>
            <Form :send="resetPassword">
                <div class="flex gap-5 flex-column-reverse md:flex-row">
                    <div class="flex-auto">
                        <FormInput name="code" type="text" v-model="newPassword.code" required readonly
                            label="Reset Code" class="mb-4" />

                        <FormInput name="password" type="password" v-model="newPassword.password" required
                        label="New Password" autocomplete="new-password" class="mb-4" />

                        <FormInput name="password" type="password" v-model="newPassword.password2" required
                        :mustMatch="{ field: 'New Password', value: newPassword.password }"
                        label="Confirm New Password" autocomplete="new-password" class="mb-4" />

                        <Button type="submit" label="Update Profile" class="w-auto">
                            Reset Password
                        </Button>
                    </div>

                </div>
            </Form>
        </PanelZone>
    </div>
</template>

<script setup>
const route = useRoute();
const query = route.query;
const newPassword = reactive({ password: '', password2: '', code: query.code?.toString() || '' });
const config = useRuntimeConfig();
const notify = useNotify();
async function resetPassword() {
    notify.info('Please wait while we reset your password...');
    const response = await useRest(`/api/${useRestVersion()}/user/${route.params.id}/reset-password`, {
        method: 'post',
        query: { includeOptions: true },
        body: { code: newPassword.code, password: newPassword.password },
    });
    if (!response.error) {
        notify.success('Password changed.');
        await navigateTo('/user/login');
    }
}
</script>