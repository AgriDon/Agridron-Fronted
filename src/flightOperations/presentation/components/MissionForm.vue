<template>
  <div class="mission-form-container">
    <h3>Nueva Misión de Vuelo</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Área de Fumigación:</label>
        <input v-model="form.farmArea" type="text" placeholder="Ej: Parcela Norte - Sector A" required />
      </div>
      <div class="form-group">
        <label>Tipo de Cultivo:</label>
        <input v-model="form.cropType" type="text" placeholder="Ej: Maíz, Papa" required />
      </div>
      <div class="form-group">
        <label>Operador Asignado:</label>
        <input v-model="form.operator" type="text" placeholder="Nombre del operador" required />
      </div>
      <button type="submit" class="btn-submit">Crear y Validar Misión</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'MissionForm',
  data() {
    return {
      form: {
        farmArea: '',
        cropType: '',
        operator: '',
        status: 'En curso',
        progress: 20
      }
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('save', { ...this.form });
      this.form.farmArea = '';
      this.form.cropType = '';
      this.form.operator = '';
    }
  }
}
</script>

<style scoped>
.mission-form-container {
  background: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  color: #fff;
  margin-bottom: 20px;
  border: 1px solid #2d2d2d;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #a0aec0;
}
.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #444;
  background: #2d2d2d;
  color: #fff;
}
.btn-submit {
  background: #00b894;
  color: #fff;
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.btn-submit:hover {
  background: #00cec9;
}
</style>