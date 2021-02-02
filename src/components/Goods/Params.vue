<template>
    <div>
      <!-- 面包屑导航 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品参数</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card>
        <!-- 警告区域 -->
          <el-alert show-icon title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false">
          </el-alert>
        <!-- 选择商品分类区域 -->
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
            <!-- 选择商品分类的级联选择框 -->
            <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps" @change="handleChange" style="width:100%">
            </el-cascader>
          </el-col>
        </el-row>
        <!-- tab页签区域 -->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <!-- 添加动态参数的面板 -->
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
            <!-- 动态参数表格 -->
            <el-table :data="manyTableData" border stripe>
              <!-- 展开行 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染所有tag标签 -->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                  <!-- 动态编辑标签 -->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column label="#" type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- 添加静态属性的面板 -->
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
            <!-- 静态属性表格 -->
            <el-table :data="onlyTableData" border stripe>
              <!-- 展开行 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染所有tag标签 -->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                  <!-- 动态编辑标签 -->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column label="#" type="index"></el-table-column>
              <el-table-column label="属性名称1111" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
      <!-- 添加对话框 -->
      <el-dialog
      :title="'添加' + textTittle"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <!-- 添加分类表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="textTittle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
      <!-- 修改参数的对话框 -->
      <el-dialog
        :title="'修改' + textTittle"
        :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClosed">
        <!-- 添加分类表单 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
          <el-form-item :label="textTittle" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      // 级联选择框配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        chilren: 'chilren',
        expandTrigger: 'hover'
        // checkStrictly: true
      },
      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // 双向绑定的ttab页标签名
      activeName: 'many',
      // 动态参数表格数据
      manyTableData: [],
      // 静态属性数据列表
      onlyTableData: [],
      addDialogVisible: false,
      // 添加分类的表单
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 编辑
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
      // 切换按钮与输入文本框!!不能共用要单独绑定
      // inputVisible: false,
      // // 双向绑定表单数据
      // inputValue: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      // 把数据列表赋值给cateList
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择框选中项变化，触发事件
    handleChange() {
      this.getParams()
    },
    // tab页签点击处理函数
    handleTabClick() {
      console.log(this.activeName)
      this.getParams()
    },
    // 获取参数
    async getParams() {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      console.log(this.selectedCateKeys)
      //  根据所选的分类id和所处的面板名，获取参数列表
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取商品参数失败！')
      // console.log(res.data)
      // 将响应对象中数据对象的所有attr_vals字符串以空格划分为数组
      res.data.forEach(item => {
        item.attr_vals = !item.attr_vals ? [] : item.attr_vals.split(' ')
        // 为每一行数据分配自己的文本框相关属性
        item.inputVisible = false
        item.inputValue = ''
      })
      // 把数据列表赋值给对应
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听添加对话框关闭事件,重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async val => {
        if (!val) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParams()
      })
    },
    // 显示修改参数对话框
    async showEditDialog(attrId) {
      // 根据id查询参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数数据失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点按钮修改参数
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) return this.$message.error('添加参数失败！')
        this.$message.success('修改参数成功！')
        this.editDialogVisible = false
        this.getParams()
      })
    },
    // 根据id删除对应的参数
    async removeParams(attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 确认删除，返回confirm。否则返回cancel
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除操作')
      // 删除
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.$message.success('删除分类成功！')
      this.getParams()
    },
    // 动态编辑标签确认，enter键或失去焦点触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没return证明需要后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttr_vals(row)
    },
    // 数据库中保存参数项的修改
    async saveAttr_vals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
      if (res.meta.status !== 200) return this.$message.error('修改参数项失败！')
      this.$message.success('修改参数项成功！')
    },
    // 展示输入框
    showInput(row) {
      row.inputVisible = true
      // 文本框自动获取焦点
      // $nextTick()函数的作用：当页面被重新渲染之后才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除参数项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttr_vals(row)
    }
  },
  computed: {
    // 按钮是否禁用
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) return true
      return false
    },
    // 获取参数的分类id
    cateId() {
      if (this.selectedCateKeys.length === 3) return this.selectedCateKeys[2]
      return null
    },
    // 添加对话框标题的计算属性
    textTittle() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 5px 8px;
}
.input-new-tag {
  width: 120px;
}
</style>
