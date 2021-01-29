<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>用户管理</el-breadcrumb-item>
          <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
          <!-- 搜索与添加区域 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
            </el-col>
          </el-row>
          <!-- 用户列表区域 -->
          <el-table :data="userList" border stripe>
              <el-table-column type="index"></el-table-column>
              <el-table-column prop="username" label="姓名"></el-table-column>
              <el-table-column prop="email" label="邮箱"></el-table-column>
              <el-table-column prop="mobile" label="电话"></el-table-column>
              <el-table-column prop="role_name" label="角色"></el-table-column>
              <el-table-column label="状态">
                <template slot-scope="scope">
                  <!-- {{scope.row}} -->
                  <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180px">
                <template slot-scope="scope">
                  <!-- {{scope.row}} !!!!!!!!!!!!!!biewanl-->
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDiolog(scope.row.id)"></el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                  <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                    <el-button type="warning" icon="el-icon-setting" size="mini" @click="showAllotRole(scope.row)"></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
          </el-table>
          <!-- 分页区域 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 3, 5]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </el-card>
        <!-- 添加用户对话框区域 -->
        <el-dialog
          title="添加用户"
          :visible.sync="addDialogVisible"
          width="50%" @close="addDialogClosed">
          <!-- 对话框主体 -->
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="addForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
              <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
          </el-form>
          <!-- 对话框尾部 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 编辑用户对话框区域  -->
        <el-dialog
          title="提示"
          :visible.sync="editDialogVisible"
          width="50%" @close="editDialogClosed">
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUser()">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 分配角色对话框区域 -->
        <el-dialog
          title="分配角色"
          :visible.sync="allotRoleDialogVisible"
          width="50%" @close="allotRoleDialogClosed">
          <div>
            <p>当前的用户:{{userInfo.username}}</p>
            <p>当前的角色:{{userInfo.role_name}}</p>
            <p>
              分配新角色:
              <el-select v-model="newRoleId" placeholder="请选择">
                <el-option
                  v-for="item in roleList"
                  :key="item.id"
                  :label="item.roleName"
                  :value="item.id">
                </el-option>
              </el-select>
            </p>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="allotRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotRole">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) return cb()
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 查询用户信息的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 保存请求回来的用户列表数据
      userList: [],
      total: 0,
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 ~ 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 ~ 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, message: '邮箱格式不正确，请重新输入', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, message: '手机号格式不正确，请重新输入', trigger: 'blur' }
        ]
      },
      editForm: {},
      editDialogVisible: false,
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, message: '邮箱格式不正确，请重新输入', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, message: '手机号格式不正确，请重新输入', trigger: 'blur' }
        ]
      },
      allotRoleDialogVisible: false,
      // 要分配角色的用户信息
      userInfo: {},
      roleList: [],
      newRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取管理员列表失败')
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(res)
    },
    // 监听pageSize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听pagenum改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听状态改变的事件
    async userStateChange(userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      console.log(userInfo)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改用户状态失败')
      }
      this.$message.success('修改用户状态成功')
    },
    // 监听关闭对话框事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户事件
    addUser() {
      // 表单预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整用户信息')
        // 添加操作
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功！')
        console.log(res)
        // 关闭对话框
        this.addDialogVisible = false
        // 刷新用户列表
        this.getUserList()
      })
    },
    // 显示编辑对话框事件
    async showEditDiolog(id) {
      // 根据id查询用户信息
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听关闭修改对话框的事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑用户并提交事件
    editUser() {
      // 表单预验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整用户信息')
        const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) return this.$message.error('更新用户信息失败！')
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新用户列表
        this.getUserList()
        // 消息提醒
        this.$message.success('更新用户信息成功！')
      })
    },
    // 删除用户操作
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 确认删除，返回confirm。否则返回cancel
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除操作')
      // 删除
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      this.$message.success('删除成功！')
      this.getUserList()
    },
    // 展示分配角色的对话框
    async showAllotRole(userInfo) {
      this.userInfo = userInfo
      // 获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('请求角色列表失败！')
      this.roleList = res.data
      console.log(this.roleList)
      console.log(this.newRoleId)
      this.allotRoleDialogVisible = true
    },
    // 分配角色
    async allotRole() {
      if (!this.newRoleId) return this.$message.error('请选择用户角色！')
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.newRoleId })
      if (res.meta.status !== 200) {
        console.log(res)
        return this.$message.error('分配角色失败！')
      }
      this.$message.success('分配角色成功！')
      this.getUserList()
      this.allotRoleDialogVisible = false
    },
    // 监听分配角色对话框关闭事件
    allotRoleDialogClosed() {
      this.newRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>

</style>
