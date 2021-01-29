<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图 -->
      <el-card>
        <!-- 添加角色区域 -->
        <el-row>
          <el-col>
            <el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>
          </el-col>
        </el-row>
        <!-- 角色列表区 -->
        <el-table :data="roleList" stripe border>
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row  :class="['bdBottom', i1===0?'bdTop':'','vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                <!-- 渲染一级权限 -->
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二三级权限 -->
                <el-col :span="19">
                  <!-- 渲染二级权限 -->
                  <el-row :class="[i2===0?'':'bdTop','vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                    <el-col :span="8">
                      <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="16">
                      <!-- 渲染三级权限 -->
                      <el-tag type="warning" :class="[i3===0?'':'bdTop']" v-for="(item3, i3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <!-- <pre>{{scope.row}}</pre> -->
            </template>
          </el-table-column>
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditRoleDialog(scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRole(scope.row.id)">删除</el-button>
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="showRightListDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <!-- 分配权限的对话框 -->
      <el-dialog title="分配权限" :visible.sync="rightListDialogVisible"
        width="50%" @close="setRightDialogClosed">
        <el-tree :data="rightList" :props="treeProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="rightListDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 添加角色的对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addRoleDialogVisible"
        width="50%" @close="addRoleDialogClosed">
        <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑角色的对话框 -->
      <el-dialog
        title="编辑角色"
        :visible.sync="editRoleDialogVisible"
        width="50%" @close="editRoleDialogClosed">
        <el-form :model="editRole" :rules="addRoleFormRules" ref="editRoleFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRole.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRole.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="toEditRole">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      rightListDialogVisible: false,
      rightList: [],
      // 树形控件属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的关键字数组
      defKeys: [],
      // 当前分配权限的角色id
      roleId: '',
      addRoleDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单验证规则!!!!!!!验证规则属性名要跟表单数据对象的属性名一样！！！！！！哭！！！！！！！
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 ~ 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入描述信息', trigger: 'blur' }
        ]
      },
      editRoleDialogVisible: false,
      // 当前要修改的角色
      editRole: {
        id: '',
        roleName: '',
        roleDesc: ''
      }
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('请求角色列表失败')
      this.roleList = res.data
      console.log(this.roleList)
    },
    // 通过ID删除权限
    async removeRightById(role, rightId) {
      const resultConfirm = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (resultConfirm !== 'confirm') return this.$message.info('已取消操作')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
      role.children = res.data
    },
    // 展示获取权限列表的对话框
    async showRightListDialog(role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')
      this.rightList = res.data
      console.log(this.rightList)
      this.getDefKeys(role, this.defKeys)
      this.roleId = role.id
      this.rightListDialogVisible = true
    },
    // 递归获取默认选中的三级节点关键字数组
    getDefKeys(node, arr) {
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => this.getDefKeys(item, arr))
    },
    // 监听对话框关闭时间，清空默认选中的数组
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击确定，分配权限
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const rid = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: rid })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.getRoleList()
      // 关闭对话框
      this.rightListDialogVisible = false
    },
    // 展示添加角色的对话框
    showAddRoleDialog() {
      this.addRoleDialogVisible = true
    },
    addRole() {
      // 表单预验证
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整角色信息')
        // 添加
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功！')
        // 关闭对话框
        this.addRoleDialogVisible = false
        // 刷新用户列表
        this.getRoleList()
      })
    },
    // 监听对话框关闭事件
    addRoleDialogClosed() {
      // this.addRoleForm = {}
      this.$refs.addRoleFormRef.resetFields()
    },
    // 展示编辑角色对话框
    showEditRoleDialog(role) {
      // 获取当前要编辑的角色
      this.editRole = role
      this.editRoleDialogVisible = true
    },
    // 编辑角色提交事件
    toEditRole() {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整角色信息')
        const { data: res } = await this.$http.put(`roles/${this.editRole.id}`, { roleName: this.editRole.roleName, roleDesc: this.editRole.roleName })
        if (res.meta.status !== 200) return this.$message.error('编辑角色失败')
        this.$message.success('编辑角色成功！')
        // 关闭对话框
        this.editRoleDialogVisible = false
        // 刷新用户列表
        this.getRoleList()
      })
    },
    // 显示确认删除事件
    async removeRole(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 取消
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除操作')
      // 删除
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.success('删除角色成功！')
      // 刷新用户列表
      this.getRoleList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 8px;
}
.bdBottom {
  border-bottom: 1px solid #ccc;
}
.bdTop {
  border-top: 1px solid #ccc;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
