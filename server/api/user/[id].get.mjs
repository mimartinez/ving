import { useUsers } from '../../vingrecord/records/User.mjs';
const Users = useUsers();
import { describeParams } from '../../utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';

export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    return user.describe(describeParams(event));
});