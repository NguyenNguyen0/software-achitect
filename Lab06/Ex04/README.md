
---

## 1. So sánh ưu / nhược điểm 
| Tiêu chí              | Choreography                                                                 | Orchestration                                                                 |
|----------------------|------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| Coupling             | Loose — service chỉ biết event, không biết nhau                              | Tighter — orchestrator biết tất cả service                                     |
| Khả năng mở rộng     | Thêm service mới chỉ cần subscribe — không đụng code cũ                     | Phải sửa orchestrator mỗi khi thêm bước                                        |
| Debug / trace        | ❌ Khó — luồng rải rác qua nhiều service, cần distributed tracing           | ✅ Dễ — toàn bộ state & log ở một chỗ                                           |
| Xử lý lỗi            | ❌ Phức tạp — mỗi service tự compensation, dễ bỏ sót                         | ✅ Tập trung — orchestrator rollback có thứ tự                                  |
| Single point of failure | ✅ Không — mỗi service độc lập                                            | ❌ Có — orchestrator chết = toàn bộ luồng dừng                                  |
| Resilience           | Cao hơn — broker buffer event khi service tạm thời chết                    | Phụ thuộc HA của orchestrator (cần deploy clustered)                           |
| Scaling              | ✅ Từng service scale độc lập theo partition/consumer group                | Orchestrator có thể trở thành bottleneck nếu tải cao                           |
| Độ phức tạp ban đầu  | Thấp hơn nếu luồng đơn giản                                                 | ✅ Rõ ràng hơn cho workflow nhiều bước / điều kiện                              |

## 2. Quyết định mô hình phù hợp

**Kết luận cho hệ thống đặt đơn thực phẩm ở quy mô thực tế:**

Với yêu cầu **scaling + resilience**, lựa chọn hợp lý nhất là **Orchestration cho saga chính** kết hợp với **event bus bất đồng bộ**, theo lý do sau:

Luồng đặt đơn có thứ tự nghiêm ngặt (reserve stock → charge → notify) và cần rollback đúng thứ tự khi thất bại — đây là điểm mạnh của orchestration. Choreography phù hợp hơn khi các sự kiện độc lập và không cần thứ tự (ví dụ: cập nhật analytics, ghi log, push notification marketing).

Để tránh orchestrator trở thành single point of failure, cần deploy orchestrator stateless + persist state ra database (PostgreSQL / Redis), chạy ít nhất 3 replica. Kafka hoặc RabbitMQ làm transport layer — khi orchestrator bị chết, message vẫn được buffer và retry khi restart.

Tóm lại: **Orchestration + persistent saga state + HA broker** là kiến trúc tối ưu cho bài toán này.