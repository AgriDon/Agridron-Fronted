<template>
  <div class="mission-card-item">
    <div class="mission-header">
      <span class="mission-title">Misión #{{ mission.id }}</span>
      <span class="badge active">{{ mission.status || 'En curso' }}</span>
    </div>
    <div class="mission-body">
      <p><strong>Parcela:</strong> {{ mission.farmArea }}</p>
      <p><strong>Cultivo:</strong> {{ mission.cropType }}</p>
      <p><strong>Operador:</strong> {{ mission.operator || 'Carlos Mendoza' }}</p>

      <div class="progress-section">
        <span class="progress-label">Progreso de la misión</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (mission.progress || 60) + '%' }"></div>
        </div>
        <span class="progress-percentage">{{ mission.progress || 60 }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MissionCard',
  props: {
    mission: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.mission-card-item {
  background: #1a2e26;
  border: 1px solid #28523c;
  border-radius: 12px;
  padding: 20px;
  color: #fff;
  margin-bottom: 15px;
}
.mission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.mission-title {
  font-size: 18px;
  font-weight: bold;
}
.badge.active {
  background: #e2fceb;
  color: #117b34;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}
.mission-body p {
  margin: 6px 0;
  color: #cbd5e0;
}
.progress-section {
  margin-top: 15px;
}
.progress-label {
  font-size: 12px;
  color: #a0aec0;
}
.progress-bar {
  background: #2d3748;
  border-radius: 6px;
  height: 8px;
  width: 100%;
  margin-top: 5px;
  overflow: hidden;
}
.progress-fill {
  background: #00b894;
  height: 100%;
}
.progress-percentage {
  display: block;
  text-align: right;
  font-size: 12px;
  margin-top: 4px;
  font-weight: bold;
}
</style>