import Vue from 'vue'
// 导入。。。。弹框提示组件
import { Button, Form, FormItem, Input, Message } from 'element-ui'
// import { Form, FormItem } from 'element-ui'
// import { Input } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message
