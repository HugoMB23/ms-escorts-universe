import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * @deprecated Esta entidad está deprecada. Usar ServiceCategoryEntity en su lugar.
 * PlanCategoryEntity fue usada para combinar tipos de servicio con niveles de plan.
 * Ahora se usa ServiceCategoryEntity para tipos de servicio y servicios_category_plan para la relación M:N.
 */
@Entity('plan_category')
export class PlanCategoryEntity {
  @PrimaryGeneratedColumn('increment')
  idCategory: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}
